import { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import connect from '../../../utils/database';

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
  available_hours: Record<string, number[]>;
  available_locations: string[];
  reviews: Record<string, unknown[]>;
  appointments: Record<string, unknown[]>;
}

export default async (
  req: NextApiRequest,
  res: NextApiResponse<ErrorResponseType | SuccessResponseType>
): Promise<void> => {
  if (req.method === 'GET') {
    const id = req.query.id as string;

    if (!id) {
      res.status(400).json({ error: 'Missing teacher id on request body' });
      return;
    }

    const { db } = await connect();
    const response = await db
      .collection('users')
      .findOne({ _id: new ObjectId(id), teacher: true });

    console.log(response);

    if (!response) {
      res.status(400).json({ error: 'Teacher not found' });
      return;
    }

    res.status(200).json(response);
  } else {
    // res.status(400).json({ error: name });
    res.status(400).json({ error: 'Worng request method' });
  }
};
