import { NextResponse } from "next/server";

type RequestBody = {
  childId: string;
  moodScore: number;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | RequestBody
    | null;

  if (!body || !body.childId || !body.moodScore) {
    return NextResponse.json(
      { error: "Missing childId or moodScore" },
      { status: 400 },
    );
  }

  // TODO: Replace this with a real GPT-4o call that
  // uses therapy goals + age + recent check-ins.
  const activities = [
    {
      title: "Breakfast Eye-Contact Game",
      description:
        "During breakfast, gently see if your child can look toward you when you say their name. Celebrate any tiny glance or turn with a smile or a high five.",
    },
    {
      title: "Feelings Picture Hunt",
      description:
        "Flip through a book or pictures together and name how characters might be feeling (happy, tired, excited). Let your child copy the faces if they enjoy it.",
    },
    {
      title: "Two-Choice Helper",
      description:
        "Offer two simple choices during the day (for example, two snacks or two toys) and wait for your child to point, look, or say which one they want.",
    },
  ];

  return NextResponse.json({
    activities,
  });
}

