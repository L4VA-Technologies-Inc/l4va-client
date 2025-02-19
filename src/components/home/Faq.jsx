import { px } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export const Faq = () => {
  const steps = [
    {
      number: 1,
      title: 'Create',
      description: 'Create a new vault by locking the required $VLRM, then configure the vault settings and governance options.',
    },
    {
      number: 2,
      title: 'Contribute',
      description: 'Contributors with vault access then send eligible assets to the vault during the contribution window, for their pro-rata share of Vault FT.',
    },
    {
      number: 3,
      title: 'Invest',
      description: 'Investors with vault access then have the opportunity to send ADA to the vault for a pro-rata share of the Vault FT.',
    },
    {
      number: 4,
      title: 'Govern',
      description: 'Once successfully locked the Vault FT holders now control the fate of the vault and its assets.',
    },
  ];

  const faqItems = [
    {
      question: 'What is L4VA?',
      answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    },
    {
      question: 'What can I do with a vault?',
      answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel leo non ante egestas tincidunt lacinia at urna. Vestibulum tempor, erat id vestibulum.',
    },
    {
      question: 'How do I create a vault?',
      answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    },
    {
      question: 'What can I put in a vault?',
      answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    },
    {
      question: 'How do I invest in a vault?',
      answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    },
    {
      question: 'How do I contribute?',
      answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    },
  ];

  return (
    <div className="relative py-12 sm:py-16">
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat h-[670px]"
        style={{ backgroundImage: 'url(/assets/investments-bg.png)' }}
      />
      <div className="container mx-auto font-satoshi">
        <section className="mb-16">
          <div className="grid grid-cols-2 gap-[70px]">
            <div className="space-y-4 text-dark-100 pr-[135px]">
              <h2 className="text-[40px] font-bold mb-8 text-primary-text font-russo">
                HOW TO PARTICIPATE
              </h2>
              <p className="text-[20px]">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent congue malesuada turpis ut lacinia. Aenean vel rhoncus nisl, nec molestie ligula.
              </p>
              <p className="text-[20px]">
                Vivamus ut porta mi. Integer sodales porta nunc, commodo nunc. Morbi nec feugiat diam. Vivamus pretium pulvinar tortor enim.
              </p>
              <p className="text-[20px]">
                Curabitur mollis scelerisque mi id pulvinar. Mauris mollis libero est, at facilisis nisl vulputat vitae. Donec ut nibh nec massa pulvinar elementum. Nunc sagittis.
              </p>
            </div>
            <div className="space-y-6">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="w-[600px] flex items-start py-[30px] pl-[60px] pr-[54px] gap-[60px] bg-white/5 backdrop-blur-sm rounded-[10px]"
                >
                  <div className="text-center text-[128px] font-extrabold text-main-red font-satoshi">
                    {step.number}
                  </div>
                  <div>
                    <h3 className="text-[32px] font-bold mb-2">
                      {step.title}
                    </h3>
                    <p className="text-[20px] text-dark-100">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section>
          <h2 className="text-[40px] font-bold mb-8 font-russo">
            FREQUENTLY ASKED QUESTIONS
          </h2>
          <Accordion collapsible className="bg-[#FFFFFF08] rounded-[10px]" type="single">
            {faqItems.map((item, index) => (
              <AccordionItem
                key={index}
                className="backdrop-blur-[20px] rounded-lg data-[state=open]:bg-[#FFFFFF1A] transition-colors border-b border-[#FFFFFF0D]"
                value={`item-${index}`}
              >
                <AccordionTrigger className="hover:no-underline text-[24px] p-8 data-[state=open]:pb-2">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-dark-100 px-8 pb-8">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </div>
    </div>

  );
};
