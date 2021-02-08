import { NextApiRequest, NextApiResponse } from 'next';
import connect from '../../utils/database';

interface IAvailableHours {
  monday: number[];
  tuesday: number[];
  wednesday: number[];
  thursday: number[];
  friday: number[];
  saturday: number[];
}
interface ErrorResponseType {
  error: string;
}

interface SuccessResponseType {
  _id: string;
  name: string;
  email: string;
  cellphone: string;
  teacher: boolean;
  coins: 1;
  courses: string[];
  available_hours: IAvailableHours;
  available_locations: string[];
  reviews: Record<string, unknown>[];
  appointments: Record<string, unknown>[];
}

export default async (
  req: NextApiRequest,
  res: NextApiResponse<ErrorResponseType | SuccessResponseType>
): Promise<void> => {
  if (req.method === 'POST') {
    const {
      name,
      email,
      cellphone,
      teacher,
      courses,
      available_hours,
      available_locations,
    }: {
      name: string;
      email: string;
      cellphone: string;
      teacher: boolean;
      courses: string[];
      available_locations: string[];
      available_hours: IAvailableHours;
    } = req.body;

    // check if available hours is between 7:00 and 20:00
    let invalidHour = false;

    for (const dayOfTheWeek in available_hours) {
      available_hours[dayOfTheWeek].forEach((hour: number) => {
        if (hour < 7 || hour > 20) {
          invalidHour = true;

          return;
        }
      });
    }

    if (invalidHour) {
      res
        .status(400)
        .json({ error: "You can't teach bettween 20:00 and 7:00" });
      return;
    }

    if (!teacher && (!name || !email || !cellphone)) {
      res
        .status(400)
        .json({ error: 'Missing body parameter for regular users' });
      return;
    } else if (
      teacher &&
      (!name ||
        !email ||
        !cellphone ||
        !courses ||
        !available_hours ||
        !available_locations)
    ) {
      res.status(400).json({ error: 'Missing body parameter for teachers' });
      return;
    }

    const { db } = await connect();

    const lowerCaseEmail = email.toLowerCase();
    const emailAlreadyExists = await db.findOne({ email: lowerCaseEmail });
    if (emailAlreadyExists) {
      res
        .status(400)
        .json({ error: `E-mail ${lowerCaseEmail} already exists` });
      return;
    }

    const response = await db.insertOne({
      name,
      email,
      cellphone,
      teacher,
      coins: 1,
      courses: courses || [],
      available_hours: available_hours || {},
      available_locations: available_locations || [],
      reviews: [],
      appointments: [],
    });

    res.status(200).json(response.ops[0]);
  } else {
    res.status(400).json({ error: 'Worng request method' });
  }
};
