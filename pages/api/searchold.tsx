import { NextApiRequest, NextApiResponse } from 'next';
import connect from '../../utils/database';

interface ErrorResponseType {
  error: string;
}

// interface SuccessResponseType {
//   _id: string;
//   name: string;
//   email: string;
//   cellphone: string;
//   teacher: boolean;
//   coins: 1;
//   courses: string[];
//   available_hours: object;
//   available_locations: string[];
//   reviews: object[];
//   appointments: object[];
// }

export default async (
  req: NextApiRequest,
  res: NextApiResponse<ErrorResponseType | object[]>
): Promise<void> => {
  if (req.method === 'GET') {
    const { courses } = req.body;

    if (!courses) {
      res.status(400).json({ error: 'Missing course on request body' });
      return;
    }

    const { db } = await connect();
    const response = await db
      .collection('users')
      .find({ courses: { $in: [new RegExp(`\w*(${courses})\w*`, 'i')] } })
      .toArray();

    if (response.length === 0) {
      res.status(400).json({ error: 'Course not found' });
      return;
    }

    res.status(200).json(response);
  } else {
    // res.status(400).json({ error: name });
    res.status(400).json({ error: 'Worng request method' });
  }
};
