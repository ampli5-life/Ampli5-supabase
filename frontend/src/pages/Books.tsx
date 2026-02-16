import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

const books = [
  {
    title: "Light on Yoga",
    author: "B.K.S. Iyengar",
    description: "A classic, detailed guide to postures and sequencing—perfect for students who enjoy technical breakdowns.",
    url: "https://www.amazon.in/dp/0008100468",
  },
  {
    title: "The Heart of Yoga",
    author: "T.K.V. Desikachar",
    description: "A practical introduction to adapting yoga to your own body, breath, and stage of life.",
    url: "https://www.amazon.in/dp/089281764X",
  },
  {
    title: "Yoga for Everyone",
    author: "Dianne Bondy",
    description: "Inclusive, body‑positive practices with clear variations so every practitioner feels welcome.",
    url: "https://www.amazon.in/dp/1465480773",
  },
  {
    title: "The Miracle of Mindfulness",
    author: "Thich Nhat Hanh",
    description: "Short, powerful stories and exercises for bringing gentle awareness into everyday life.",
    url: "https://www.amazon.in/dp/1846041066",
  },
];

const Books = () => (
  <>
    <section className="bg-primary py-16 text-primary-foreground">
      <div className="container text-center">
        <h1 className="font-serif text-4xl font-bold md:text-5xl">Recommended Reads</h1>
        <p className="mx-auto mt-4 max-w-2xl opacity-90">
          A curated shelf of books we return to again and again for movement, mindfulness, and modern yoga wisdom.
        </p>
      </div>
    </section>

    <section className="py-16">
      <div className="container">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {books.map((book) => (
            <Card key={book.title} className="h-full border-0 shadow-sm">
              <CardContent className="flex h-full flex-col p-5">
                <div className="mb-3 flex items-center gap-2 text-primary">
                  <BookOpen className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wide">Book</span>
                </div>
                <h2 className="font-serif text-lg font-semibold">{book.title}</h2>
                <p className="mt-1 text-sm text-primary font-medium">{book.author}</p>
                <p className="mt-3 flex-1 text-sm text-muted-foreground">{book.description}</p>
                {book.url && (
                  <Button asChild variant="outline" size="sm" className="mt-4">
                    <a href={book.url} target="_blank" rel="noopener noreferrer">
                      View book
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  </>
);

export default Books;

