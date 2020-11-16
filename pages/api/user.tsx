import { NextApiRequest, NextApiResponse } from 'next';
import connect from '../../utils/database';

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
  available_hours: object;
  available_locations: string[];
  reviews: object[];
  appointments: object[];
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
    } = req.body;

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

    const response = await db.collection('users').insertOne({
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
