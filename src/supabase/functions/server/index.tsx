import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { createClient } from '@supabase/supabase-js';
import * as kv from './kv_store.ts';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string,
);

// Bucket names
const BUCKET_NAME = 'make-75c29e11-profiles';
const BUCKET_COFFEE_IMAGES = 'make-75c29e11-coffees';

// Initialize storage buckets
async function initializeBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  
  // Profile photos bucket
  const profileBucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
  if (!profileBucketExists) {
    await supabase.storage.createBucket(BUCKET_NAME, { public: false });
    console.log('Created private bucket:', BUCKET_NAME);
  }
  
  // Coffee images bucket
  const coffeeBucketExists = buckets?.some(bucket => bucket.name === BUCKET_COFFEE_IMAGES);
  if (!coffeeBucketExists) {
    await supabase.storage.createBucket(BUCKET_COFFEE_IMAGES, { public: true });
    console.log('Created public bucket:', BUCKET_COFFEE_IMAGES);
  }
}

// Initialize with default data
async function initializeData() {
  // Check if branches exist
  const branches = await kv.getByPrefix('', 'branches:');
  if (branches.length === 0) {
    // Create default branches
    const defaultBranches = [
      { id: 'branch1', name: 'MyBKOP Sudirman', address: 'Jl. Sudirman No. 123, Jakarta' },
      { id: 'branch2', name: 'MyBKOP Thamrin', address: 'Jl. Thamrin No. 456, Jakarta' },
      { id: 'branch3', name: 'MyBKOP Kuningan', address: 'Jl. Kuningan No. 789, Jakarta' }
    ];
    
    for (const branch of defaultBranches) {
      await kv.set('', `branches:${branch.id}`, branch);
    }
    console.log('Initialized default branches');
  }

  // Check if coffees exist
  const coffees = await kv.getByPrefix('', 'coffees:');
  if (coffees.length === 0) {
    // Create default coffee items
    const defaultCoffees = [
      {
        id: 'coffee1',
        name: 'Espresso',
        description: 'Kopi hitam pekat dengan rasa yang kuat',
        price: 25000,
        image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400',
        category: 'Hot Coffee'
      },
      {
        id: 'coffee2',
        name: 'Cappuccino',
        description: 'Espresso dengan susu dan foam yang creamy',
        price: 35000,
        image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=400',
        category: 'Hot Coffee'
      },
      {
        id: 'coffee3',
        name: 'Latte',
        description: 'Espresso dengan susu yang lembut',
        price: 38000,
        image: 'https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=400',
        category: 'Hot Coffee'
      },
      {
        id: 'coffee4',
        name: 'Iced Americano',
        description: 'Espresso dingin dengan air es',
        price: 30000,
        image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400',
        category: 'Iced Coffee'
      },
      {
        id: 'coffee5',
        name: 'Iced Latte',
        description: 'Latte dingin yang menyegarkan',
        price: 40000,
        image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400',
        category: 'Iced Coffee'
      },
      {
        id: 'coffee6',
        name: 'Caramel Macchiato',
        description: 'Espresso dengan vanilla dan caramel',
        price: 45000,
        image: 'https://images.unsplash.com/photo-1599398054066-846f28917f38?w=400',
        category: 'Specialty'
      }
    ];
    
    for (const coffee of defaultCoffees) {
      await kv.set('', `coffees:${coffee.id}`, coffee);
    }
    console.log('Initialized default coffee items');
  }

  // Check if admin exists
  const adminCheck = await kv.getByPrefix('', 'users:');
  const adminExists = adminCheck.some((user: any) => user.role === 'admin');
  
  if (!adminExists) {
    // Create default admin user
    const adminId = 'user-admin';
    const { data: adminAuth } = await supabase.auth.admin.createUser({
      email: 'admin@mybkop.com',
      password: 'admin123',
      email_confirm: true,
      user_metadata: { name: 'Admin MyBKOP' }
    });

    if (adminAuth?.user) {
      await kv.set('', `users:${adminAuth.user.id}`, {
        id: adminAuth.user.id,
        email: 'admin@mybkop.com',
        name: 'Admin MyBKOP',
        role: 'admin',
        phone: '081234567890',
        photoUrl: '',
        branch: 'branch1'
      });
      console.log('Created default admin user: admin@mybkop.com / admin123');
    }
  }
}

// Initialize on startup
initializeBucket();
initializeData();

// ============= AUTH ROUTES =============

app.post('/make-server-75c29e11/signup', async (c) => {
  try {
    const { email, password, name, phone } = await c.req.json();

    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, and name are required' }, 400);
    }

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name }
    });

    if (authError) {
      console.log('Auth error during signup:', authError);
      return c.json({ error: authError.message }, 400);
    }

    // Store user data in KV
    const userData = {
      id: authData.user.id,
      email,
      name,
      role: 'customer',
      phone: phone || '',
      photoUrl: '',
      branch: 'branch1'
    };

    await kv.set('', `users:${authData.user.id}`, userData);

    return c.json({ 
      success: true, 
      user: userData
    });
  } catch (error) {
    console.log('Error during signup:', error);
    return c.json({ error: String(error) }, 500);
  }
});

app.post('/make-server-75c29e11/login', async (c) => {
  try {
    const { email, password } = await c.req.json();

    const supabaseClient = createClient(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    );

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.log('Auth error during login:', error);
      return c.json({ error: error.message }, 401);
    }

    // Get user data from KV
    const userData = await kv.get('', `users:${data.user.id}`);

    return c.json({
      success: true,
      accessToken: data.session.access_token,
      user: userData
    });
  } catch (error) {
    console.log('Error during login:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ============= BRANCHES ROUTES =============

app.get('/make-server-75c29e11/branches', async (c) => {
  try {
    const branches = await kv.getByPrefix('', 'branches:');
    return c.json({ branches });
  } catch (error) {
    console.log('Error fetching branches:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ============= COFFEE ROUTES =============

app.get('/make-server-75c29e11/coffees', async (c) => {
  try {
    const coffees = await kv.getByPrefix('', 'coffees:');
    return c.json({ coffees });
  } catch (error) {
    console.log('Error fetching coffees:', error);
    return c.json({ error: String(error) }, 500);
  }
});

app.get('/make-server-75c29e11/coffees/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const coffee = await kv.get('', `coffees:${id}`);
    
    if (!coffee) {
      return c.json({ error: 'Coffee not found' }, 404);
    }
    
    return c.json({ coffee });
  } catch (error) {
    console.log('Error fetching coffee detail:', error);
    return c.json({ error: String(error) }, 500);
  }
});

app.post('/make-server-75c29e11/coffees', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Check if user is admin
    const userData = await kv.get('', `users:${user.id}`);
    if (userData?.role !== 'admin') {
      return c.json({ error: 'Only admin can add coffee items' }, 403);
    }

    const { name, description, price, image, category } = await c.req.json();
    
    if (!name || !price) {
      return c.json({ error: 'Name and price are required' }, 400);
    }

    const coffeeId = `coffee${Date.now()}`;
    const newCoffee = {
      id: coffeeId,
      name,
      description: description || '',
      price: Number(price),
      image: image || '',
      category: category || 'Other'
    };

    await kv.set('', `coffees:${coffeeId}`, newCoffee);

    return c.json({ success: true, coffee: newCoffee });
  } catch (error) {
    console.log('Error creating coffee:', error);
    return c.json({ error: String(error) }, 500);
  }
});

app.put('/make-server-75c29e11/coffees/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get('', `users:${user.id}`);
    if (userData?.role !== 'admin') {
      return c.json({ error: 'Only admin can update coffee items' }, 403);
    }

    const id = c.req.param('id');
    const { name, description, price, image, category } = await c.req.json();
    
    const existingCoffee = await kv.get('', `coffees:${id}`);
    if (!existingCoffee) {
      return c.json({ error: 'Coffee not found' }, 404);
    }

    const updatedCoffee = {
      ...existingCoffee,
      name: name || existingCoffee.name,
      description: description !== undefined ? description : existingCoffee.description,
      price: price !== undefined ? Number(price) : existingCoffee.price,
      image: image !== undefined ? image : existingCoffee.image,
      category: category || existingCoffee.category
    };

    await kv.set('', `coffees:${id}`, updatedCoffee);

    return c.json({ success: true, coffee: updatedCoffee });
  } catch (error) {
    console.log('Error updating coffee:', error);
    return c.json({ error: String(error) }, 500);
  }
});

app.delete('/make-server-75c29e11/coffees/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get('', `users:${user.id}`);
    if (userData?.role !== 'admin') {
      return c.json({ error: 'Only admin can delete coffee items' }, 403);
    }

    const id = c.req.param('id');
    
    // Get coffee to delete image if exists
    const coffee = await kv.get('', `coffees:${id}`);
    if (coffee?.imageStoragePath) {
      await supabase.storage.from(BUCKET_COFFEE_IMAGES).remove([coffee.imageStoragePath]);
    }
    
    await kv.del('', `coffees:${id}`);

    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting coffee:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ============= COFFEE IMAGE UPLOAD =============

app.post('/make-server-75c29e11/admin/coffee-image', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get('', `users:${user.id}`);
    if (userData?.role !== 'admin') {
      return c.json({ error: 'Only admin can upload coffee images' }, 403);
    }

    const formData = await c.req.formData();
    const file = formData.get('image');
    
    if (!file || !(file instanceof File)) {
      return c.json({ error: 'Image file is required' }, 400);
    }

    // Upload image
    const fileExt = file.name.split('.').pop();
    const filePath = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const fileBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_COFFEE_IMAGES)
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: true
      });

    if (uploadError) {
      console.log('Error uploading coffee image:', uploadError);
      return c.json({ error: uploadError.message }, 500);
    }

    // Get public URL
    const { data } = supabase.storage
      .from(BUCKET_COFFEE_IMAGES)
      .getPublicUrl(filePath);

    return c.json({ 
      success: true, 
      imageUrl: data.publicUrl,
      imageStoragePath: filePath
    });
  } catch (error) {
    console.log('Error uploading coffee image:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ============= FAVORITES ROUTES =============

app.get('/make-server-75c29e11/favorites', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const favorites = await kv.getByPrefix(user.id, `favorites:${user.id}:`);
    
    // Get full coffee details for each favorite
    const favoritesWithDetails = await Promise.all(
      favorites.map(async (fav: any) => {
        const coffee = await kv.get('', `coffees:${fav.coffeeId}`);
        return {
          ...fav,
          coffee
        };
      })
    );

    return c.json({ favorites: favoritesWithDetails });
  } catch (error) {
    console.log('Error fetching favorites:', error);
    return c.json({ error: String(error) }, 500);
  }
});

app.post('/make-server-75c29e11/favorites', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { coffeeId } = await c.req.json();
    
    if (!coffeeId) {
      return c.json({ error: 'Coffee ID is required' }, 400);
    }

    const favorite = {
      userId: user.id,
      coffeeId,
      addedAt: new Date().toISOString()
    };

    await kv.set(user.id, `favorites:${user.id}:${coffeeId}`, favorite);

    return c.json({ success: true, favorite });
  } catch (error) {
    console.log('Error adding favorite:', error);
    return c.json({ error: String(error) }, 500);
  }
});

app.delete('/make-server-75c29e11/favorites/:coffeeId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const coffeeId = c.req.param('coffeeId');
    await kv.del(user.id, `favorites:${user.id}:${coffeeId}`);

    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting favorite:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ============= CART ROUTES =============

app.get('/make-server-75c29e11/cart', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const cartItems = await kv.getByPrefix(user.id, `cart:${user.id}:`);
    
    // Get full coffee details for each cart item
    const cartWithDetails = await Promise.all(
      cartItems.map(async (item: any) => {
        const coffee = await kv.get('', `coffees:${item.coffeeId}`);
        return {
          ...item,
          coffee
        };
      })
    );

    return c.json({ cart: cartWithDetails });
  } catch (error) {
    console.log('Error fetching cart:', error);
    return c.json({ error: String(error) }, 500);
  }
});

app.post('/make-server-75c29e11/cart', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { coffeeId, quantity } = await c.req.json();
    
    if (!coffeeId || !quantity) {
      return c.json({ error: 'Coffee ID and quantity are required' }, 400);
    }

    // Check if item already exists in cart
    const existingItem = await kv.get(user.id, `cart:${user.id}:${coffeeId}`);
    
    const cartItem = {
      userId: user.id,
      coffeeId,
      quantity: existingItem ? existingItem.quantity + Number(quantity) : Number(quantity),
      addedAt: existingItem?.addedAt || new Date().toISOString()
    };

    await kv.set(user.id, `cart:${user.id}:${coffeeId}`, cartItem);

    return c.json({ success: true, cartItem });
  } catch (error) {
    console.log('Error adding to cart:', error);
    return c.json({ error: String(error) }, 500);
  }
});

app.put('/make-server-75c29e11/cart/:coffeeId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const coffeeId = c.req.param('coffeeId');
    const { quantity } = await c.req.json();
    
    if (quantity === undefined) {
      return c.json({ error: 'Quantity is required' }, 400);
    }

    const existingItem = await kv.get(user.id, `cart:${user.id}:${coffeeId}`);
    if (!existingItem) {
      return c.json({ error: 'Cart item not found' }, 404);
    }

    const updatedItem = {
      ...existingItem,
      quantity: Number(quantity)
    };

    await kv.set(user.id, `cart:${user.id}:${coffeeId}`, updatedItem);

    return c.json({ success: true, cartItem: updatedItem });
  } catch (error) {
    console.log('Error updating cart:', error);
    return c.json({ error: String(error) }, 500);
  }
});

app.delete('/make-server-75c29e11/cart/:coffeeId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const coffeeId = c.req.param('coffeeId');
    await kv.del(user.id, `cart:${user.id}:${coffeeId}`);

    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting cart item:', error);
    return c.json({ error: String(error) }, 500);
  }
});

app.delete('/make-server-75c29e11/cart', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const cartItems = await kv.getByPrefix(user.id, `cart:${user.id}:`);
    const deletePromises = cartItems.map((item: any) => 
      kv.del(user.id, `cart:${user.id}:${item.coffeeId}`)
    );
    
    await Promise.all(deletePromises);

    return c.json({ success: true });
  } catch (error) {
    console.log('Error clearing cart:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ============= PROFILE ROUTES =============

app.get('/make-server-75c29e11/profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get('', `users:${user.id}`);
    
    if (!userData) {
      return c.json({ error: 'User not found' }, 404);
    }

    // If user has photoUrl, get signed URL
    if (userData.photoUrl) {
      const { data: signedData } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(userData.photoUrl, 3600);
      
      if (signedData) {
        userData.photoSignedUrl = signedData.signedUrl;
      }
    }

    return c.json({ user: userData });
  } catch (error) {
    console.log('Error fetching profile:', error);
    return c.json({ error: String(error) }, 500);
  }
});

app.put('/make-server-75c29e11/profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { name, phone, branch } = await c.req.json();
    
    const userData = await kv.get('', `users:${user.id}`);
    if (!userData) {
      return c.json({ error: 'User not found' }, 404);
    }

    const updatedUser = {
      ...userData,
      name: name !== undefined ? name : userData.name,
      phone: phone !== undefined ? phone : userData.phone,
      branch: branch !== undefined ? branch : userData.branch
    };

    await kv.set('', `users:${user.id}`, updatedUser);

    return c.json({ success: true, user: updatedUser });
  } catch (error) {
    console.log('Error updating profile:', error);
    return c.json({ error: String(error) }, 500);
  }
});

app.post('/make-server-75c29e11/profile/photo', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const formData = await c.req.formData();
    const file = formData.get('photo');
    
    if (!file || !(file instanceof File)) {
      return c.json({ error: 'Photo file is required' }, 400);
    }

    // Delete old photo if exists
    const userData = await kv.get('', `users:${user.id}`);
    if (userData?.photoUrl) {
      await supabase.storage.from(BUCKET_NAME).remove([userData.photoUrl]);
    }

    // Upload new photo
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;
    
    const fileBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: true
      });

    if (uploadError) {
      console.log('Error uploading photo:', uploadError);
      return c.json({ error: uploadError.message }, 500);
    }

    // Update user with new photo path
    const updatedUser = {
      ...userData,
      photoUrl: filePath
    };
    await kv.set('', `users:${user.id}`, updatedUser);

    // Get signed URL
    const { data: signedData } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, 3600);

    return c.json({ 
      success: true, 
      photoUrl: filePath,
      photoSignedUrl: signedData?.signedUrl 
    });
  } catch (error) {
    console.log('Error uploading profile photo:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ============= ORDERS ROUTES =============

app.get('/make-server-75c29e11/orders', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const allOrders = await kv.getByPrefix('', 'orders:');
    const userOrders = allOrders.filter((order: any) => order.userId === user.id);

    return c.json({ orders: userOrders });
  } catch (error) {
    console.log('Error fetching orders:', error);
    return c.json({ error: String(error) }, 500);
  }
});

app.post('/make-server-75c29e11/orders', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { items, total, paymentName, notes, branchId } = await c.req.json();
    
    if (!items || !total) {
      return c.json({ error: 'Items and total are required' }, 400);
    }

    const orderId = `order${Date.now()}`;
    const order = {
      id: orderId,
      userId: user.id,
      items,
      total: Number(total),
      paymentName: paymentName || '',
      notes: notes || '',
      branchId: branchId || '',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    await kv.set('', `orders:${orderId}`, order);

    // Clear user's cart after order
    const cartItems = await kv.getByPrefix(user.id, `cart:${user.id}:`);
    const deletePromises = cartItems.map((item: any) => 
      kv.del(user.id, `cart:${user.id}:${item.coffeeId}`)
    );
    await Promise.all(deletePromises);

    return c.json({ success: true, order });
  } catch (error) {
    console.log('Error creating order:', error);
    return c.json({ error: String(error) }, 500);
  }
});

export default app;