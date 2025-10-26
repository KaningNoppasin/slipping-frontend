import Link from "next/link";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Building2, Rocket } from "lucide-react";

const pricingPlans = [
  {
    name: "Starter",
    price: "2.9%",
    priceDetail: "+ $0.30",
    description: "Perfect for small businesses and startups",
    monthlyFee: "$0",
    transactionLimit: "Up to 1,000",
    features: [
      "2.9% + $0.30 per transaction",
      "Up to 1,000 transactions/month",
      "Standard payment processing",
      "Basic fraud protection",
      "Email support",
      "Standard settlement (T+2)",
      "Dashboard analytics",
      "Multi-currency support (5 currencies)",
    ],
    popular: false,
    cta: "Get Started Free",
    variant: "outline" as const,
    icon: Zap,
  },
  {
    name: "Business",
    price: "2.4%",
    priceDetail: "+ $0.25",
    description: "Best for growing businesses",
    monthlyFee: "$49",
    transactionLimit: "Up to 10,000",
    features: [
      "2.4% + $0.25 per transaction",
      "Up to 10,000 transactions/month",
      "Priority payment processing",
      "Advanced fraud detection",
      "Priority support (24/7)",
      "Faster settlement (T+1)",
      "Advanced analytics & reporting",
      "Multi-currency support (20+ currencies)",
      "API access",
      "Custom webhooks",
      "Batch processing",
    ],
    popular: true,
    cta: "Start Free Trial",
    variant: "default" as const,
    icon: Building2,
  },
  {
    name: "Enterprise",
    price: "1.9%",
    priceDetail: "+ $0.20",
    description: "For high-volume businesses",
    monthlyFee: "$199",
    transactionLimit: "Unlimited",
    features: [
      "1.9% + $0.20 per transaction",
      "Unlimited transactions",
      "Custom payment solutions",
      "Enterprise-grade security",
      "Dedicated account manager",
      "Same-day settlement (T+0)",
      "White-label solutions",
      "Multi-currency support (50+ currencies)",
      "Full API access",
      "Custom integrations",
      "Advanced batch processing",
      "Custom reporting",
      "SLA guarantee (99.9% uptime)",
      "Compliance assistance",
    ],
    popular: false,
    cta: "Contact Sales",
    variant: "secondary" as const,
    icon: Rocket,
  },
];

export default function PricingPage() {
  return (
    <ContentLayout title="SlipPayment Pricing">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Pricing</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-6 space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <Badge variant="outline" className="mb-2">
            Transaction-Based Pricing
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight">
            Simple, Transparent Pricing for Your Payments
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Pay only for what you use. No hidden fees, no surprises. Start processing payments with SlipPayment today.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
          {pricingPlans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card
                key={plan.name}
                className={`relative flex flex-col ${plan.popular ? "border-primary shadow-lg scale-105" : ""
                  }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}

                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>

                  <div className="mt-4 space-y-2">
                    <div>
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-xl text-muted-foreground"> {plan.priceDetail}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      per transaction
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <Badge variant="secondary">{plan.monthlyFee}/month</Badge>
                      <span className="text-xs text-muted-foreground">
                        {plan.transactionLimit} transactions
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-grow">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    variant={plan.variant}
                    className="w-full"
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Cost Calculator */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Calculate Your Costs</CardTitle>
            <CardDescription>
              See how much you'll save with SlipPayment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Monthly Transaction Volume</label>
                <input
                  type="number"
                  placeholder="e.g., 5000"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Average Transaction Amount</label>
                <input
                  type="number"
                  placeholder="e.g., 100"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Estimated Monthly Cost</label>
                <div className="text-2xl font-bold text-primary">$XXX.XX</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Fees Section */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Transaction Fees</CardTitle>
            <CardDescription>
              Transparent pricing for special transaction types
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <span className="font-medium">Refund Processing</span>
                <Badge variant="outline">Free</Badge>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <span className="font-medium">Chargeback Fee</span>
                <Badge variant="outline">$15.00</Badge>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <span className="font-medium">Cross-border Transaction</span>
                <Badge variant="outline">+1.0%</Badge>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <span className="font-medium">Currency Conversion</span>
                <Badge variant="outline">+1.5%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <CardDescription>
              Common questions about SlipPayment pricing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Are there any hidden fees?</h3>
              <p className="text-sm text-muted-foreground">
                No. We believe in transparent pricing. The only fees you pay are the transaction fees and monthly subscription (if applicable). All additional fees are clearly listed above.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Can I change plans at any time?</h3>
              <p className="text-sm text-muted-foreground">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">What payment methods do you support?</h3>
              <p className="text-sm text-muted-foreground">
                SlipPayment supports all major credit cards (Visa, Mastercard, Amex), debit cards, digital wallets, and bank transfers. Enterprise plans can add custom payment methods.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">How quickly will I receive my funds?</h3>
              <p className="text-sm text-muted-foreground">
                Settlement times vary by plan: Starter (T+2 days), Business (T+1 day), and Enterprise (same-day settlement available).
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Is there a free trial?</h3>
              <p className="text-sm text-muted-foreground">
                Yes! All plans come with a 14-day free trial. Test our platform with up to 100 transactions at no cost. No credit card required to start.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ContentLayout>
  );
}
