import { useNavigate } from 'react-router-dom';

export function useWatchAction(movieId: string | undefined) {
  const navigate = useNavigate();
  return {
    goToRating: () => {
      if (movieId) navigate(`/movies/${movieId}/rating`);
    }
  };
}
