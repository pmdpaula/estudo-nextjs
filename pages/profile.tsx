import { NextPage } from 'next';
import useSWR from 'swr';
import { signIn, signOut, useSession } from 'next-auth/client';

import api from '../utils/api';
import Nav from '../components/nav';

const ProfilePage: NextPage = () => {
  const [session, loading] = useSession();

  const { data, error } = useSWR(`/api/user/${session?.user.email}`, api);

  return (
    <div>
      <Nav />
      {!session && (
        <div className="text-3xl">
          Favor fazer login para acessar esta página.
          <br />
          <button onClick={(): Promise<void> => signIn('auth0')}>
            Sign in
          </button>
        </div>
      )}
      {session && data && (
        <>
          <h1>Bem vindo a página Profile</h1>
          <div className="text-3xl">
            Signed in as {session.user.email} <br />
            <button onClick={(): Promise<void> => signOut()}>Sign out</button>
          </div>
          <p className="text-xl">{data.data.name}</p>
          <p className="text-xl">{data.data.coins} moeda(s)</p>
        </>
      )}
      {error && <h1>Usuário como e-mail {session?.user.email} não existe.</h1>}
      {loading && (
        <div className="text-5xl">
          <h1>Carregando</h1>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
