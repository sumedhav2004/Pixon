import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { pricingCards } from "@/lib/constants";
import { cn } from "@/lib/utils";
import Image from "next/image";
import clsx from 'clsx';
import { Check } from "lucide-react";
import Link from "next/link";
import { Spotlight } from "@/components/ui/Spotlight";

export default function Home() {
  return (
      <>
        <section className="min-h-screen w-full pt-20 flex items-center justify-center flex-col text-center max-w-screen">
          <Spotlight />


          <p className="text-center">Empowering Agencies, Elevating Brands.</p>
          <div className="bg-gradient-to-r from-primary to-secondary-foreground text-transparent bg-clip-text relative">
            <h1 className="text-9xl font-bold text-center md:text-[300px]">Pixon</h1>
          </div>

          <div className="flex justify-center items-center relative md:mt-[-70px]">
            <Image src={'/assets/preview.png'} alt="banner image" height={400} width={800} className="rounded-tl-2xl rounded-tr-2xl border-2 border-muted" />

            <div className="bottom-0 top-[50%] bg-gradient-to-t dark:from-background left-0 right-0 absolute z-10"></div>
          </div>

        </section>

        <section className="flex justify-center flex-col gap-4 md:!mt-20 mt-[-60px]">
          <h2 className="text-4xl text-center">
            Choose the best for you
          </h2>
          <p className="text-muted-foreground text-center">
            Our pricing plans are tailored to meet your needs. If {"you're"} not <br/> ready to commit you can get started for free.
          </p>

          <div className="flex justify-center gap-4 flex-wrap mt-6">
            {pricingCards.map((card)=>(
              //WIP: Wire up free product from stripe
              <Card key={card.title} className={clsx('w-[300px] flex flex-col justify-between', {
                'border-2 border-primary': card.title === 'Unlimited Saas',
              })}>
                <CardHeader>
                  <CardTitle className={clsx('',{
                    'text-muted-foreground': card.title !== 'Unlimited Saas'
                  })}>
                    {card.title}
                  </CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="text-4xl font-bold">
                    {card.price}
                  </span>
                  <span className="text-muted-foreground">
                    /m
                  </span>
                </CardContent>

                <CardFooter className="flex flex-col items-start gap-4">
                  <div>
                    {card.features.map((feature)=>(
                      <div className="flex gap-2 items-center" key={feature}>
                        <Check className="text-muted-foreground" />
                        <p>{feature}</p>
                      </div>
                    ))}
                  </div>
                  <Link href={`/agency?plan=${card.priceId}`} className={clsx("w-full text-center text-white bg-primary p-2 rounded-md", {'!bg-muted-foreground':card.title !== 'Unlimited Saas'})}>Get Started</Link>

                </CardFooter>
              </Card>

            ))}
          </div>
        </section>
      </>
      
  );
}
