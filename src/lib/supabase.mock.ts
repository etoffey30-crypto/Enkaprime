// Lightweight mock supabase client for local UI development.
// Methods mirror the parts of the Supabase JS client used by the app.

function makeBuilder(result: any = { data: [], error: null }) {
  const builder: any = {};
  builder.eq = () => builder;
  builder.limit = () => builder;
  builder.single = async () => result;
  builder.select = () => builder;
  builder.order = () => builder;
  builder.filter = () => builder;
  builder.neq = () => builder;
  builder.is = () => builder;
  builder.ilike = () => builder;
  builder.range = () => builder;
  builder.insert = async (payload: any) => ({ data: payload, error: null });
  builder.update = async (payload: any) => ({ data: payload, error: null });
  builder.delete = async () => ({ data: [], error: null });
  builder.then = (onfulfilled?: any, onrejected?: any) => Promise.resolve(result).then(onfulfilled, onrejected);
  builder.catch = (onrejected?: any) => Promise.resolve(result).catch(onrejected);
  return builder;
}

export const mockSupabase = {
  from: (_table: string) => {
    // Return a builder that resolves to empty data by default
    return makeBuilder({ data: [], error: null });
  },
  storage: {
    from: (bucket: string) => ({
      upload: async (path: string, _file: any) => ({ data: { path }, error: null }),
      getPublicUrl: (path: string) => ({ publicURL: `https://mock.storage/${bucket}/${path}` }),
      remove: async (_path: string) => ({ data: null, error: null }),
    }),
  },
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: (_cb: any) => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: async () => ({ data: { user: null, session: null }, error: null }),
    signUp: async () => ({ data: { user: null, session: null }, error: null }),
    signOut: async () => ({ error: null }),
    user: () => null,
  },
  rpc: async () => ({ data: null, error: null }),
};

export default mockSupabase;
