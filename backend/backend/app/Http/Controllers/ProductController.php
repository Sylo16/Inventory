<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index()
    {
        return Product::with('category')->get()->map(function ($product) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'quantity' => $product->quantity,
                'unitPrice' => $product->unitPrice,
                'unitOfMeasurement' => $product->unitOfMeasurement,
                'category' => $product->category->name,
                'UpdatedAt' => $product->updated_at->format('Y-m-d')
            ];
        });
    }

    public function receive(Request $request, $id)
    {
        $product = Product::findOrFail($id);
        $quantity = $request->validate([
            'quantity' => 'required|integer|min:1'
        ])['quantity'];
        
        $product->increment('quantity', $quantity);
        $product->touch();

        return response()->json([
            'message' => 'Product quantity increased successfully',
            'newQuantity' => $product->quantity
        ]);
    }

    public function deduct(Request $request, $id)
    {
        $product = Product::findOrFail($id);
        $quantity = $request->validate([
            'quantity' => 'required|integer|min:1'
        ])['quantity'];

        if ($product->quantity < $quantity) {
            return response()->json([
                'error' => 'Insufficient stock'
            ], 400);
        }

        $product->decrement('quantity', $quantity);
        $product->touch();

        return response()->json([
            'message' => 'Product quantity decreased successfully',
            'newQuantity' => $product->quantity
        ]);
    }
    public function store(Request $request)
{
    $validated = $request->validate([
        'name' => 'required|string',
        'description' => 'nullable|string',
        'sku' => 'required|string|unique:products',
        'category_id' => 'required|exists:categories,id',
        'unitPrice' => 'required|numeric',
        'quantity' => 'required|integer',
        'unitOfMeasurement' => 'required|string',
    ]);

    $product = Product::create($validated);

    return response()->json([
        'message' => 'Product created successfully',
        'product' => $product
    ], 201);
}


    // You can add other methods like store, update, delete, etc.
}
