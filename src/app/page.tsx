import Link from "next/link";

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardTitle} from "@/components/ui/card";
import {Clock3, CloudSun} from "lucide-react";

const features = [
  {
    title: "Weather App",
    description: "Get real-time weather updates for your favorite cities.",
    href: "/weather",
    icon: <CloudSun className="w-8 h-8 text-blue-500"/>,
  },
  {
    title: "World Clock",
    description: "Track current time across multiple timezones in real-time.",
    href: "/timezone",
    icon: <Clock3 className="w-8 h-8 text-blue-500"/>,
  }
  // {
  //   title: "RSS Feed Manager",
  //   description: "Subscribe to and manage RSS feeds in one place.",
  //   href: "/rss",
  //   icon: <Rss className="w-8 h-8 text-orange-500" />,
  // },
  // {
  //   title: "Important Dates",
  //   description: "Track birthdays, events, and special reminders easily.",
  //   href: "/dates",
  //   icon: <Calendar className="w-8 h-8 text-purple-500" />,
  // },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <section className="max-w-4xl mx-auto text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome to Your Personal Dashboard
        </h1>
      </section>
      
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {features.map((feature) => (
          <Link key={feature.title} href={feature.href}>
            <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer">
              <CardContent className="p-6 flex flex-col items-start gap-4">
                {feature.icon}
                <CardTitle className="text-xl text-gray-800">
                  {feature.title}
                </CardTitle>
                <p className="text-sm text-gray-500">{feature.description}</p>
                <Button variant="outline" className="mt-4">
                  Open
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>
    </main>
  );
}
