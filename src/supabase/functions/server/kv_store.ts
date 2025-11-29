import { createClient } from "@supabase/supabase-js";

// --------------------------
// SUPABASE CLIENT
// --------------------------
const client = () =>
  createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
  );

// --------------------------
// SIMPLE MEMORY CACHE
// --------------------------
const memoryCache = new Map<string, any>();

// --------------------------
// KEY NAMESPACE BUILDER
// --------------------------
const buildKey = (userId: string, key: string) => `${userId}:${key}`;

// --------------------------
// SET
// --------------------------
export const set = async (
  userId: string,
  key: string,
  value: any
): Promise<void> => {
  const supabase = client();
  const fullKey = buildKey(userId, key);

  // simpan ke memory cache
  memoryCache.set(fullKey, value);

  const { error } = await supabase.from("kv_store_75c29e11").upsert({
    key: fullKey,
    value,
  });

  if (error) throw new Error(error.message);
};

// --------------------------
// GET
// --------------------------
export const get = async (
  userId: string,
  key: string
): Promise<any> => {
  const supabase = client();
  const fullKey = buildKey(userId, key);

  // cek di cache dulu (super cepat)
  if (memoryCache.has(fullKey)) {
    return memoryCache.get(fullKey);
  }

  const { data, error } = await supabase
    .from("kv_store_75c29e11")
    .select("value")
    .eq("key", fullKey)
    .maybeSingle();

  if (error) throw new Error(error.message);

  // simpan ke cache
  if (data?.value !== undefined) {
    memoryCache.set(fullKey, data.value);
  }

  return data?.value;
};

// --------------------------
// DELETE
// --------------------------
export const del = async (
  userId: string,
  key: string
): Promise<void> => {
  const supabase = client();
  const fullKey = buildKey(userId, key);

  // hapus dari cache
  memoryCache.delete(fullKey);

  const { error } = await supabase
    .from("kv_store_75c29e11")
    .delete()
    .eq("key", fullKey);

  if (error) throw new Error(error.message);
};

// --------------------------
// MULTI SET
// --------------------------
export const mset = async (
  userId: string,
  keys: string[],
  values: any[]
): Promise<void> => {
  const supabase = client();

  const rows = keys.map((k, i) => {
    const fk = buildKey(userId, k);

    // update cache
    memoryCache.set(fk, values[i]);

    return { key: fk, value: values[i] };
  });

  const { error } = await supabase
    .from("kv_store_75c29e11")
    .upsert(rows);

  if (error) throw new Error(error.message);
};

// --------------------------
// MULTI GET
// --------------------------
export const mget = async (
  userId: string,
  keys: string[]
): Promise<any[]> => {
  const supabase = client();

  const fullKeys = keys.map((k) => buildKey(userId, k));

  // cek dulu nilai yang sudah ada di cache
  let allCached = true;
  const cachedValues: any[] = [];

  for (const k of fullKeys) {
    if (!memoryCache.has(k)) {
      allCached = false;
      break;
    }
    cachedValues.push(memoryCache.get(k));
  }

  if (allCached) return cachedValues;

  const { data, error } = await supabase
    .from("kv_store_75c29e11")
    .select("key, value")
    .in("key", fullKeys);

  if (error) throw new Error(error.message);

  // update cache
  data?.forEach((d) => {
    memoryCache.set(d.key, d.value);
  });

  // urutkan sesuai order input
  return fullKeys.map((k) => memoryCache.get(k));
};

// --------------------------
// MULTI DELETE
// --------------------------
export const mdel = async (
  userId: string,
  keys: string[]
): Promise<void> => {
  const supabase = client();
  const fullKeys = keys.map((k) => buildKey(userId, k));

  // hapus cache
  fullKeys.forEach((k) => memoryCache.delete(k));

  const { error } = await supabase
    .from("kv_store_75c29e11")
    .delete()
    .in("key", fullKeys);

  if (error) throw new Error(error.message);
};

// --------------------------
// GET ALL BY PREFIX (PER-USER)
// --------------------------
export const getByPrefix = async (
  userId: string,
  prefix: string
): Promise<any[]> => {
  const supabase = client();
  const fullPrefix = `${userId}:${prefix}`;

  const { data, error } = await supabase
    .from("kv_store_75c29e11")
    .select("key, value")
    .like("key", fullPrefix + "%");

  if (error) throw new Error(error.message);

  // update cache
  data?.forEach((d) => memoryCache.set(d.key, d.value));

  return data?.map((d) => d.value) ?? [];
};
