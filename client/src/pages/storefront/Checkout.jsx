import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronRight, Lock, ShieldCheck, Truck, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import {
  selectCartItems, selectCartTotals, selectCoupon, clearCart,
} from '../../store/slices/cartSlice.js';
import { selectUser } from '../../store/slices/authSlice.js';
import { formatPrice, cx } from '../../lib/formatters.js';
import { checkoutApi, loadRazorpayScript } from '../../lib/api/checkout.js';

const addressSchema = z.object({
  fullName: z.string().min(2, 'Required'),
  phone: z.string().min(7, 'Phone required'),
  line1: z.string().min(3, 'Address line required'),
  line2: z.string().optional(),
  city: z.string().min(2, 'City required'),
  state: z.string().optional(),
  postalCode: z.string().min(3, 'Postal code required'),
  country: z.string().length(2, 'Use 2-letter code').default('IN'),
});

const STEPS = [
  { key: 'address', label: 'Address', icon: Truck },
  { key: 'review', label: 'Review', icon: ShieldCheck },
  { key: 'payment', label: 'Payment', icon: CreditCard },
];

export default function Checkout() {
  const items = useSelector(selectCartItems);
  const totals = useSelector(selectCartTotals);
  const coupon = useSelector(selectCoupon);
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [step, setStep] = useState('address');
  const [shipping, setShipping] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) navigate('/login?next=/checkout');
    else if (items.length === 0) navigate('/cart');
  }, [user, items.length, navigate]);

  if (!user || items.length === 0) return null;

  const goReview = (data) => { setShipping(data); setStep('review'); };

  const placeOrder = async () => {
    setSubmitting(true);
    try {
      const payload = {
        items: items.map((i) => ({ product: i.productId, qty: i.qty, sku: i.variant?.sku || '' })),
        shipping,
        couponCode: coupon?.code || '',
        paymentMethod,
      };
      const res = await checkoutApi.createOrder(payload);

      if (paymentMethod === 'cod') {
        dispatch(clearCart());
        toast.success('Order placed!');
        navigate(`/order/${res.order.id}`);
        return;
      }

      // Razorpay
      const rp = res.razorpay;
      if (rp?.isDevMock) {
        // Dev: skip the modal and verify with mock signature
        await checkoutApi.verifyPayment({
          razorpayOrderId: rp.orderId,
          razorpayPaymentId: `pay_dev_${Date.now()}`,
          razorpaySignature: 'dev_mock_signature',
        });
        dispatch(clearCart());
        toast.success('Payment captured (dev mock)');
        navigate(`/order/${res.order.id}`);
        return;
      }

      const ok = await loadRazorpayScript();
      if (!ok) throw new Error('Razorpay failed to load');
      const instance = new window.Razorpay({
        key: rp.key,
        order_id: rp.orderId,
        amount: rp.amount,
        currency: rp.currency,
        name: 'Sahara Groceries',
        description: `Order ${res.order.orderNumber}`,
        prefill: { name: shipping.fullName, contact: shipping.phone, email: user.email },
        theme: { color: '#C8A24B' },
        handler: async (rpRes) => {
          try {
            await checkoutApi.verifyPayment({
              razorpayOrderId: rpRes.razorpay_order_id,
              razorpayPaymentId: rpRes.razorpay_payment_id,
              razorpaySignature: rpRes.razorpay_signature,
            });
            dispatch(clearCart());
            toast.success('Payment successful');
            navigate(`/order/${res.order.id}`);
          } catch (err) {
            toast.error(err?.response?.data?.message || 'Payment verification failed');
          }
        },
        modal: { ondismiss: () => toast('Payment cancelled') },
      });
      instance.open();
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Order failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container py-10 lg:py-14">
      <header className="mb-8">
        <p className="eyebrow text-gold">Secure checkout</p>
        <h1 className="mt-3 font-display text-4xl text-ink-800 sm:text-5xl">Checkout</h1>
        <p className="mt-2 text-ink-500">Just a few details and your sun-baked goods are on their way.</p>
      </header>

      <Stepper step={step} />

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {step === 'address' && (
            <AddressForm initial={shipping || prefillAddress(user)} onSubmit={goReview} />
          )}

          {step === 'review' && (
            <ReviewStep
              shipping={shipping}
              items={items}
              onBack={() => setStep('address')}
              onNext={() => setStep('payment')}
            />
          )}

          {step === 'payment' && (
            <PaymentStep
              method={paymentMethod}
              setMethod={setPaymentMethod}
              onBack={() => setStep('review')}
              onSubmit={placeOrder}
              submitting={submitting}
              total={totals.total}
            />
          )}
        </div>

        <Summary items={items} totals={totals} coupon={coupon} />
      </div>
    </section>
  );
}

function prefillAddress(user) {
  const a = user?.addresses?.[0];
  return {
    fullName: a?.fullName || user?.name || '',
    phone: a?.phone || '',
    line1: a?.line1 || '',
    line2: a?.line2 || '',
    city: a?.city || '',
    state: a?.state || '',
    postalCode: a?.postalCode || '',
    country: a?.country || 'IN',
  };
}

function Stepper({ step }) {
  return (
    <ol className="flex items-center gap-3 text-xs uppercase tracking-wider">
      {STEPS.map((s, i) => {
        const active = STEPS.findIndex((x) => x.key === step) >= i;
        const Icon = s.icon;
        return (
          <li key={s.key} className="flex items-center gap-3">
            <div className={cx(
              'flex items-center gap-2 rounded-md border px-3 py-1.5',
              active ? 'border-gold bg-gold/10 text-gold' : 'border-ink-200 text-ink-400',
            )}>
              <Icon size={12} />
              <span>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && <ChevronRight size={12} className="text-ink-300" />}
          </li>
        );
      })}
    </ol>
  );
}

function AddressForm({ initial, onSubmit }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initial,
    resolver: zodResolver(addressSchema),
  });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
      <h2 className="font-display text-2xl text-ink-800">Shipping Information</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Full name" {...register('fullName')} error={errors.fullName?.message} />
        <Input label="Phone" {...register('phone')} error={errors.phone?.message} />
      </div>
      <Input label="Address line 1" {...register('line1')} error={errors.line1?.message} />
      <Input label="Address line 2 (optional)" {...register('line2')} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Input label="City" {...register('city')} error={errors.city?.message} />
        <Input label="State / Region" {...register('state')} />
        <Input label="Postal code" {...register('postalCode')} error={errors.postalCode?.message} />
      </div>
      <Input label="Country (2-letter)" maxLength={2} {...register('country')} error={errors.country?.message} />
      <div className="flex justify-end">
        <Button type="submit">Continue to review <ChevronRight size={16} /></Button>
      </div>
    </form>
  );
}

function ReviewStep({ shipping, items, onBack, onNext }) {
  return (
    <div className="space-y-6 rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
      <h2 className="font-display text-2xl text-ink-800">Review Your Order</h2>
      <div>
        <p className="text-xs uppercase tracking-wider text-ink-400">Shipping to</p>
        <p className="mt-1 font-display text-lg text-ink-800">{shipping.fullName}</p>
        <p className="text-sm text-ink-600">{shipping.line1}{shipping.line2 ? `, ${shipping.line2}` : ''}</p>
        <p className="text-sm text-ink-600">{shipping.city}{shipping.state ? `, ${shipping.state}` : ''} {shipping.postalCode}, {shipping.country}</p>
        <p className="mt-1 text-xs text-ink-400">{shipping.phone}</p>
      </div>
      <div className="border-t border-ink-100 pt-6">
        <p className="mb-3 text-xs uppercase tracking-wider text-ink-400">Items ({items.length})</p>
        <ul className="space-y-3">
          {items.map((it) => (
            <li key={it.key} className="flex items-center gap-3">
              <img src={it.image} alt={it.name} className="h-14 w-14 rounded-lg object-cover" />
              <div className="flex-1">
                <p className="text-sm font-medium text-ink-800">{it.name}</p>
                <p className="text-xs text-ink-400">{it.variant?.label ? `${it.variant.label} · ` : ''}Qty {it.qty}</p>
              </div>
              <p className="text-sm text-ink-700">{formatPrice(it.price * it.qty)}</p>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack}>Back</Button>
        <Button onClick={onNext}>Continue to payment <ChevronRight size={16} /></Button>
      </div>
    </div>
  );
}

function PaymentStep({ method, setMethod, onBack, onSubmit, submitting, total }) {
  const options = [
    { key: 'razorpay', label: 'Card / UPI / Netbanking', sub: 'Secured by Razorpay', icon: CreditCard },
    { key: 'cod', label: 'Cash on delivery', sub: 'Pay when your order arrives', icon: Truck },
  ];
  return (
    <div className="space-y-6 rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
      <h2 className="font-display text-2xl text-ink-800">Payment Details</h2>
      <ul className="space-y-3">
        {options.map((o) => {
          const Icon = o.icon;
          const active = method === o.key;
          return (
            <li key={o.key}>
              <button
                type="button"
                onClick={() => setMethod(o.key)}
                className={cx(
                  'flex w-full items-center gap-4 rounded-xl border p-4 text-left transition',
                  active ? 'border-gold bg-gold/5' : 'border-ink-200 hover:border-ink-300',
                )}
              >
                <Icon size={20} className={active ? 'text-gold' : 'text-ink-400'} />
                <div className="flex-1">
                  <p className="font-medium text-ink-800">{o.label}</p>
                  <p className="text-xs text-ink-500">{o.sub}</p>
                </div>
                <span className={cx(
                  'h-4 w-4 rounded-full border',
                  active ? 'border-gold bg-gold' : 'border-ink-300',
                )} />
              </button>
            </li>
          );
        })}
      </ul>
      <div className="flex items-center gap-2 text-xs text-ink-500">
        <Lock size={12} /> Your payment information is encrypted and never stored on our servers.
      </div>
      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack}>Back</Button>
        <Button onClick={onSubmit} disabled={submitting}>
          {submitting ? 'Processing…' : `Place Order — ${formatPrice(total)}`}
        </Button>
      </div>
    </div>
  );
}

function Summary({ items, totals, coupon }) {
  return (
    <aside className="space-y-5 rounded-2xl border border-ink-100 bg-cream-100 p-6 h-fit shadow-card lg:sticky lg:top-28">
      <h3 className="font-display text-xl text-ink-800">Order Summary</h3>
      <ul className="max-h-64 space-y-3 overflow-auto pr-1">
        {items.map((it) => (
          <li key={it.key} className="flex gap-3 text-sm">
            <img src={it.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
            <div className="flex-1">
              <p className="line-clamp-1 text-ink-800">{it.name}</p>
              <p className="text-xs text-ink-500">Qty {it.qty}</p>
            </div>
            <p className="text-ink-700">{formatPrice(it.price * it.qty)}</p>
          </li>
        ))}
      </ul>
      <div className="space-y-2 border-t border-ink-200/60 pt-4 text-sm">
        <Row label="Subtotal" value={formatPrice(totals.subtotal)} />
        {coupon && totals.discount > 0 && (
          <Row label={`Discount (${coupon.code})`} value={`-${formatPrice(totals.discount)}`} accent />
        )}
        <Row label="Shipping" value={totals.shipping ? formatPrice(totals.shipping) : 'Free'} />
        <Row label="Taxes" value={formatPrice(totals.tax)} />
        <div className="my-3 h-px bg-ink-200/60" />
        <Row
          label={<span className="font-display text-lg text-ink-800">Total</span>}
          value={<span className="font-display text-lg text-gold">{formatPrice(totals.total)}</span>}
        />
      </div>
      <Link to="/cart" className="block text-center text-xs text-ink-500 hover:text-gold">Edit cart</Link>
    </aside>
  );
}

function Row({ label, value, accent }) {
  return (
    <div className={'flex items-center justify-between ' + (accent ? 'text-gold' : 'text-ink-600')}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
