import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Faq = () => {
  const steps = [
    {
      number: 1,
      title: "Create",
      description: "Create a Vault and pretium mollis nisl, non scelerisque velit vehicula vel."
    },
    {
      number: 2,
      title: "Contribute",
      description: "Present pulvinar tortor enim, vitae consectetur ex posuere id. Curabitur vehicula pellentesque viverra."
    },
    {
      number: 3,
      title: "Invest",
      description: "Curabitur vehicula pellentesque viverra. Present pulvinar tortor enim, vitae consectetur ex posuere id."
    }
  ];

  const faqItems = [
    {
      question: "What is LAVA?",
      answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    },
    {
      question: "What can I do with a vault?",
      answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel leo non ante egestas tincidunt lacinia at urna. Vestibulum tempor, erat id vestibulum."
    },
    {
      question: "How do I create a vault?",
      answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    },
    {
      question: "What can I put in a vault?",
      answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    },
    {
      question: "How do I invest in a vault?",
      answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    },
    {
      question: "How do I contribute?",
      answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-12">
      <section className="mb-16">
        <h2 className="text-4xl font-bold mb-8 text-primary-text font-['Russo_One']">
          HOW TO PARTICIPATE
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4 text-dark-100">
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent congue malesuada turpis ut lacinia. Aenean vel rhoncus nisl, nec molestie ligula.</p>
            <p>Vivamus ut porta mi. Integer sodales porta nunc, commodo nunc. Morbi nec feugiat diam. Vivamus pretium pulvinar tortor enim.</p>
            <p>Curabitur mollis scelerisque mi id pulvinar. Mauris mollis libero est, at facilisis nisl vulputat vitae. Donec ut nibh nec massa pulvinar elementum. Nunc sagittis.</p>
          </div>

          {/* Right column with numbered steps */}
          <div className="space-y-6">
            {steps.map((step) => (
              <div key={step.number} className="flex items-start gap-4">
                <div className="text-4xl font-bold text-main-red font-['Russo_One']">
                  {step.number}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-primary-text mb-2">{step.title}</h3>
                  <p className="text-dark-100">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section>
        <h2 className="text-4xl font-bold mb-8 text-primary-text font-['Russo_One']">
          FREQUENTLY ASKED QUESTIONS
        </h2>

        <Accordion type="single" collapsible className="space-y-2">
          {faqItems.map((item, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border border-[#202233] rounded-lg overflow-hidden bg-[#000322]"
            >
              <AccordionTrigger className="px-6 py-4 text-primary-text hover:no-underline hover:bg-[#202233]">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="px-6 py-4 text-dark-100">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  );
};
