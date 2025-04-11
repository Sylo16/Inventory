<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Category;

class ProductsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
          // Create a sample category if none exists
    $category = Category::firstOrCreate([
        'name' => 'Building Materials'
    ]);

    // Insert sample products
    Product::create([
        'name' => 'Portland Cement',
        'quantity' => 500,
        'unitPrice' => 120,
        'unitOfMeasurement' => 'sack',
        'category_id' => $category->id,
        'sku' => 'CEM-001'
    ]);

    // Add more products as needed...
    }
}
