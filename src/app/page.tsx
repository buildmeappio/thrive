import { redirect } from 'next/navigation';

const Home = async () => {
  redirect('/getting-started');
}
export default Home;