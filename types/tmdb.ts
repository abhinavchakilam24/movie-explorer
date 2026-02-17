export type TmdbMovieSummary = {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  poster_path: string | null;
};

export type TmdbSearchResponse = {
  results: TmdbMovieSummary[];
};

export type TmdbMovieDetails = TmdbMovieSummary & {
  runtime: number | null;
  genres?: { id: number; name: string }[];
};

export type TmdbCastMember = {
  id: number;
  name: string;
  character?: string;
  profile_path?: string | null;
  order?: number;
};

export type TmdbCrewMember = {
  id: number;
  name: string;
  job?: string;
  department?: string;
};

export type TmdbCreditsResponse = {
  id: number;
  cast: TmdbCastMember[];
  crew: TmdbCrewMember[];
};

export type MovieDetailsPayload = {
  details: TmdbMovieDetails;
  credits: TmdbCreditsResponse;
};
