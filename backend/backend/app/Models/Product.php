<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    // You can add additional properties or methods as needed
    protected $fillable = [
        'name',
        'description',
        'sku',
        'category_id',
        'unitPrice',
        'quantity',
        'unitOfMeasurement',
    ];
    
    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
