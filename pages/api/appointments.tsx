import { ObjectID } from 'mongodb';
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/client';
import connect from '../../utils/database';

interface User {
  name: string;
  email: string;
  cellphone: string;
  teacher: boolean;
  coins: number;
  courses: string[];
  available_hours: Record<string, number[]>;
  available_locations: string[];
  reviews: Record<string, unknown>[];
  appointments: {
    date: string;
  }[];
  _id: string;
}

interface ErrorResponseType {
  error: string;
}

interface SuccessResponseType {
  date: string;
  teacher_name: string;
  teacher_id: string;
  student_name: string;
  student_id: string;
  course: string;
  location: string;
  appointment_link: string;
}

export default async (
  req: NextApiRequest,
  res: NextApiResponse<ErrorResponseType | SuccessResponseType>
): Promise<void> => {
  if (req.method === 'POST') {
    const session = await getSession({ req });
    if (!session) {
      res.status(400).json({ error: 'Please login first' });
      return;
    }

    const {
      date,
      teacher_name,
      teacher_id,
      student_name,
      student_id,
      course,
      location,
      appointment_link,
    }: {
      date: string;
      teacher_name: string;
      teacher_id: string;
      student_name: string;
      student_id: string;
      course: string;
      location: string;
      appointment_link: string;
    } = req.body;

    if (
      !date ||
      !teacher_name ||
      !teacher_id ||
      !student_name ||
      !student_id ||
      !course ||
      !location
    ) {
      res.status(400).json({ error: 'Missing parameter on request body' });
      return;
    }
    const { db } = await connect();

    const teacherExists = await db
      .collection('users')
      .findOne({ _id: new ObjectID(teacher_id) });

    if (!teacherExists) {
      res.status(400).json({
        error: `Teacher ${teacher_name} with ID ${teacher_id} does not exist`,
      });
      return;
    }

    const studentExists = await db
      .collection('users')
      .findOne({ _id: new ObjectID(student_id) });

    if (!studentExists) {
      res.status(400).json({
        error: `Student ${student_name} with ID ${student_id} does not exist`,
      });
      return;
    }

    const appointment = {
      date,
      teacher_name,
      teacher_id,
      student_name,
      student_id,
      course,
      location,
      appointment_link: appointment_link || '',
    };

    await db
      .collection('users')
      .updateOne(
        { _id: new ObjectID(teacher_id) },
        { $push: { appointments: appointment }, $inc: { coins: 1 } }
      );

    await db
      .collection('users')
      .updateOne(
        { _id: new ObjectID(student_id) },
        { $push: { appointments: appointment }, $inc: { coins: -1 } }
      );
    res.status(200).json(appointment);
  } else {
    res.status(400).json({ error: 'Worng request method' });
  }
};
