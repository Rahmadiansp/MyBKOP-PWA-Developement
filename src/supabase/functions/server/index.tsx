/* Table schema:
CREATE TABLE kv_store_75c29e11 (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);
*/

// Simple KV store for Supabase
import { createClient } from "@supabase/supabase-js";

// ----------------------
// Supabase Client Factory
// ----------------------
const client = () =>
  createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
  );

// ----------------------
// SET
// ----------------------
export const set = async (key: string, value: any): Promise<void> => {
  const supabase = client();
  const { error } = await supabase.from("kv_store_75c29e11").upsert({
    key,
    value,
  });

  if (error) throw new Error(error.message);
};

// ----------------------
// GET
// ----------------------
export const get = async (key: string): Promise<any> => {
  const supabase = client();
  const { data, error } = await supabase
    .from("kv_store_75c29e11")
    .select("value")
    .eq("key", key)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data?.value;
};

// ----------------------
// DELETE
// ----------------------
export const del = async (key: string): Promise<void> => {
  const supabase = client();
  const { error } = await supabase
    .from("kv_store_75c29e11")
    .delete()
    .eq("key", key);

  if (error) throw new Error(error.message);
};

// ----------------------
// MULTI SET
// ----------------------
export const mset = async (
  keys: string[],
  values: any[]
): Promise<void> => {
  const supabase = client();

  const rows = keys.map((k, i) => ({
    key: k,
    value: values[i],
  }));

  const { error } = await supabase
    .from("kv_store_75c29e11")
    .upsert(rows);

  if (error) throw new Error(error.message);
};

// ----------------------
// MULTI GET
// ----------------------
export const mget = async (keys: string[]): Promise<any[]> => {
  const supabase = client();

  const { data, error } = await supabase
    .from("kv_store_75c29e11")
    .select("value")
    .in("key", keys);

  if (error) throw new Error(error.message);

  return data?.map((d) => d.value) ?? [];
};

// ----------------------
// MULTI DELETE
// ----------------------
export const mdel = async (keys: string[]): Promise<void> => {
  const supabase = client();

  const { error } = await supabase
    .from("kv_store_75c29e11")
    .delete()
    .in("key", keys);

  if (error) throw new Error(error.message);
};

// ----------------------
// GET BY PREFIX
// ----------------------
export const getByPrefix = async (prefix: string): Promise<any[]> => {
  const supabase = client();

  const { data, error } = await supabase
    .from("kv_store_75c29e11")
    .select("key, value")
    .like("key", prefix + "%");

  if (error) throw new Error(error.message);

  return data?.map((d) => d.value) ?? [];
};
