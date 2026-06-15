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
  builder.insert = async (payload: any) => ({ data: payload, error: null });
  builder.update = async (payload: any) => ({ data: payload, error: null });
  builder.delete = async () => ({ data: [], error: null });
  return builder;
}

export const mockSupabase = {
  from: (table: string) => {
    // Return a builder that resolves to empty data by default
    return makeBuilder({ data: [], error: null });
  },
  storage: {
    from: (bucket: string) => ({
      upload: async (path: string, file: any) => ({ data: { path }, error: null }),
      getPublicUrl: (path: string) => ({ publicURL: `https://mock.storage/${bucket}/${path}` }),
      remove: async (path: string) => ({ data: null, error: null }),
    }),
  },
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
    user: () => null,
  },
  rpc: async () => ({ data: null, error: null }),
};

export default mockSupabase;
