import { NextResponse } from 'next/server';
import type { QuoteOfTheDay, ApiResponse } from '@/types/api';

const quotes: QuoteOfTheDay[] = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds" },
  { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
  { text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.", author: "Martin Fowler" },
  { text: "Programs must be written for people to read, and only incidentally for machines to execute.", author: "Harold Abelson" },
  { text: "The most dangerous phrase in the language is: We've always done it this way.", author: "Grace Hopper" },
  { text: "Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away.", author: "Antoine de Saint-Exupéry" },
  { text: "The computer was born to solve problems that did not exist before.", author: "Bill Gates" },
  { text: "Measuring programming progress by lines of code is like measuring aircraft building progress by weight.", author: "Bill Gates" },
  { text: "Before software can be reusable it first has to be usable.", author: "Ralph Johnson" },
  { text: "Make it work, make it right, make it fast.", author: "Kent Beck" },
  { text: "Walking on water and developing software from a specification are easy if both are frozen.", author: "Edward V. Berard" },
  { text: "The function of good software is to make the complex appear to be simple.", author: "Grady Booch" },
  { text: "There are two ways to write error-free programs; only the third one works.", author: "Alan J. Perlis" },
  { text: "A language that doesn't affect the way you think about programming is not worth knowing.", author: "Alan J. Perlis" },
  { text: "The best error message is the one that never shows up.", author: "Thomas Fuchs" },
  { text: "Delete code. Delete code. Delete code.", author: "Unknown" },
  { text: "Weeks of coding can save you hours of planning.", author: "Unknown" },
  { text: "It's not a bug – it's an undocumented feature.", author: "Unknown" },
  { text: "Code never lies, comments sometimes do.", author: "Ron Jeffries" },
  { text: "The quieter you become, the more you can hear.", author: "Ram Dass" },
  { text: "Almost everything will work again if you unplug it for a few minutes, including you.", author: "Anne Lamott" },
  { text: "Disconnect to reconnect.", author: "Unknown" },
  { text: "Technology is a useful servant but a dangerous master.", author: "Christian Lous Lange" },
  { text: "The real problem is not whether machines think but whether men do.", author: "B.F. Skinner" },
  { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
  { text: "Not all those who wander are lost.", author: "J.R.R. Tolkien" },
];

export async function GET() {
  // Get a random quote
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  const result: ApiResponse<QuoteOfTheDay> = {
    data: quote,
    error: null,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(result);
}
