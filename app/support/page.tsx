"use client";

import { AppShell } from "@/components/layout/app-shell";
import { AuthGuard } from "@/components/auth/auth-guard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  HelpCircle,
  Phone,
  Mail,
  MessageSquare,
  Clock,
  MapPin,
  BookOpen,
  Users,
  Calendar,
  DollarSign,
  FileText,
} from "lucide-react";

export default function SupportPage() {
  const faqs = [
    {
      question: "How do I update my profile information?",
      answer:
        "Go to 'My Profile' in the sidebar menu. Click the 'Edit' button to update your personal information, contact details, and profile picture.",
    },
    {
      question: "How can I check my membership eligibility status?",
      answer:
        "Visit the 'My Eligibility' page from the sidebar. You'll see your current eligibility status, payment history, and any outstanding requirements.",
    },
    {
      question: "How do I register for church events?",
      answer:
        "Navigate to the 'Events' page, browse upcoming events, and click 'Register' on any event you wish to attend. You can manage your registrations from the same page.",
    },
    {
      question: "How do I participate in church voting?",
      answer:
        "When there's an active vote, go to 'Active Votes' from the sidebar. Review the voting options and cast your vote. Your vote is secure and confidential.",
    },
    {
      question: "Can I manage my family members' information?",
      answer:
        "Yes! Go to 'Family & Documents' in the member portal. You can add family members, update their information, and manage family documents.",
    },
    {
      question: "How do I make payments or donations?",
      answer:
        "Contact the church office or your ministry leader for payment and donation options. We accept various payment methods including cash, check, and online transfers.",
    },
    {
      question: "How can I access church documents and resources?",
      answer:
        "Visit the 'Family & Documents' section in the member portal. You'll find shared church documents, announcements, and resources available for download.",
    },
    {
      question: "What should I do if I forgot my password?",
      answer:
        "On the login page, click 'Forgot Password?' and follow the instructions to reset your password via email.",
    },
  ];

  const contactMethods = [
    {
      icon: Phone,
      title: "Phone",
      detail: "+1 (555) 123-4567",
      action: "Call Us",
      href: "tel:+15551234567",
      color:
        "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400",
    },
    {
      icon: Mail,
      title: "Email",
      detail: "support@church.com",
      action: "Send Email",
      href: "mailto:support@church.com",
      color: "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400",
    },
    {
      icon: MessageSquare,
      title: "WhatsApp",
      detail: "+1 (555) 123-4568",
      action: "Chat Now",
      href: "https://wa.me/15551234568",
      color:
        "bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400",
    },
    {
      icon: MapPin,
      title: "Visit Us",
      detail: "123 Church St, City",
      action: "Get Directions",
      href: "https://maps.google.com",
      color:
        "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400",
    },
  ];

  const quickLinks = [
    { icon: BookOpen, label: "User Guide", href: "#" },
    { icon: Users, label: "Member Portal", href: "/member-portal" },
    { icon: Calendar, label: "Events Calendar", href: "/events" },
    { icon: DollarSign, label: "Payment Info", href: "#" },
    { icon: FileText, label: "Church Policies", href: "#" },
  ];

  return (
    <AuthGuard>
      <AppShell>
        <div className='space-y-6'>
          {/* Header */}
          <div className='bg-card rounded-xl p-6 border shadow-sm'>
            <div className='flex items-center space-x-3 mb-2'>
              <div className='p-2 bg-purple-500 rounded-lg shadow-md'>
                <HelpCircle className='h-6 w-6 text-white' />
              </div>
              <h1 className='text-2xl font-bold text-foreground'>
                Help & Support 🆘
              </h1>
            </div>
            <p className='text-muted-foreground'>
              We&apos;re here to help! Find answers or reach out to our support
              team
            </p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* Main Content */}
            <div className='lg:col-span-2 space-y-6'>
              {/* Contact Methods */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Us</CardTitle>
                  <CardDescription>
                    Choose your preferred way to reach our support team
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {contactMethods.map((method, index) => (
                      <a
                        key={index}
                        href={method.href}
                        target={
                          method.href.startsWith("http") ? "_blank" : undefined
                        }
                        rel={
                          method.href.startsWith("http")
                            ? "noopener noreferrer"
                            : undefined
                        }
                        className='block'
                      >
                        <Card className='hover:shadow-md transition-shadow cursor-pointer'>
                          <CardContent className='p-4'>
                            <div className='flex items-start space-x-3'>
                              <div className={`p-2 rounded-lg ${method.color}`}>
                                <method.icon className='h-5 w-5' />
                              </div>
                              <div className='flex-1'>
                                <h4 className='font-semibold text-sm mb-1'>
                                  {method.title}
                                </h4>
                                <p className='text-xs text-muted-foreground mb-2'>
                                  {method.detail}
                                </p>
                                <span className='text-xs font-medium text-blue-600 dark:text-blue-400'>
                                  {method.action} →
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Office Hours */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center space-x-2'>
                    <Clock className='h-5 w-5' />
                    <span>Support Hours</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-2 text-sm'>
                    <div className='flex justify-between'>
                      <span className='font-medium'>Monday - Friday</span>
                      <span className='text-muted-foreground'>
                        9:00 AM - 5:00 PM
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='font-medium'>Saturday</span>
                      <span className='text-muted-foreground'>
                        10:00 AM - 2:00 PM
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='font-medium'>Sunday</span>
                      <span className='text-muted-foreground'>
                        Before/After Services
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* FAQs */}
              <Card>
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                  <CardDescription>
                    Quick answers to common questions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type='single' collapsible className='w-full'>
                    {faqs.map((faq, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className='text-left'>
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className='text-muted-foreground'>
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className='space-y-6'>
              {/* Quick Links */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>Quick Links</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-2'>
                    {quickLinks.map((link, index) => (
                      <a
                        key={index}
                        href={link.href}
                        className='flex items-center space-x-3 p-2 rounded-lg hover:bg-muted transition-colors'
                      >
                        <link.icon className='h-4 w-4 text-muted-foreground' />
                        <span className='text-sm'>{link.label}</span>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tips */}
              <Card className='bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border-amber-200 dark:border-amber-800'>
                <CardHeader>
                  <CardTitle className='text-lg'>💡 Support Tip</CardTitle>
                </CardHeader>
                <CardContent className='space-y-2 text-sm'>
                  <p className='text-muted-foreground'>
                    Before submitting a ticket, try searching our FAQ section -
                    you might find an instant answer!
                  </p>
                  <p className='text-muted-foreground'>
                    For urgent matters during off-hours, please call our
                    emergency hotline: <strong>+1 (555) 999-9999</strong>
                  </p>
                </CardContent>
              </Card>

              {/* Response Time */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>Response Times</CardTitle>
                </CardHeader>
                <CardContent className='space-y-3 text-sm'>
                  <div>
                    <div className='flex items-center justify-between mb-1'>
                      <span className='font-medium'>Email</span>
                      <span className='text-muted-foreground'>24-48 hours</span>
                    </div>
                    <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
                      <div className='bg-blue-600 h-2 rounded-full w-3/4'></div>
                    </div>
                  </div>
                  <div>
                    <div className='flex items-center justify-between mb-1'>
                      <span className='font-medium'>Phone</span>
                      <span className='text-muted-foreground'>Immediate</span>
                    </div>
                    <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
                      <div className='bg-green-600 h-2 rounded-full w-full'></div>
                    </div>
                  </div>
                  <div>
                    <div className='flex items-center justify-between mb-1'>
                      <span className='font-medium'>Ticket</span>
                      <span className='text-muted-foreground'>12-24 hours</span>
                    </div>
                    <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
                      <div className='bg-purple-600 h-2 rounded-full w-5/6'></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </AppShell>
    </AuthGuard>
  );
}
