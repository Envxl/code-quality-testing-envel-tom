const database_ = require('../db/database');

exports.getAllProducts = (request, res) => {
    const database = database_.getDb();

    database.all('SELECT * FROM products', [], async function (error, products) {
        if (error) {
            res.status(400).json({"error": error.message});
            return;
        }

        const productsWithDetails = [];

        for (const product of products) {

            await new Promise((resolve) => {
                database.get(
                    'SELECT COUNT(*) as total FROM products WHERE price <= ?',
                    [product.price],
                    (error_, result) => {
                        if (!error_) {
                            product.cheaperCount = result.total;
                        }
                        resolve();
                    }
                );
            });

            await new Promise((resolve) => {
                database.get(
                    'SELECT AVG(price) as avg FROM products',
                    [],
                    (error_, result) => {
                        if (!error_) {
                            product.avgPrice = result.avg;
                        }
                        resolve();
                    }
                );
            });

            productsWithDetails.push(product);
        }

        res.json({
            "data": productsWithDetails,
            "message": "success"
        });
    });
};

exports.createProduct = (request, res) => {
    const {name, price, stock} = request.body;
    const database = database_.getDb();

    database.run(
        `INSERT INTO products (name, price, stock) VALUES (?, ?, ?)`,
        [name, price, stock],
        function(error) {
            if (error) {
                console.error(error);
                return res.status(500).json({error: 'Error creating product'});
            }
            res.status(201).json({
                id: this.lastID,
                name,
                price,
                stock
            });
        }
    );
};

exports.getProduct = (request, res) => {
    const id = request.params.id;
    const database = database_.getDb();

    database.get(
        'SELECT * FROM products WHERE id = ?',
        [id],
        (error, result) => {
            if (error) {
                res.status(400).json({"error":error.message});
                return;
            }
            res.json({
                "data":result,
                "message":"success"
            });
        }
    );
};

exports.updateStock = (request, res) => {
    const { id } = request.params;
    const { stock } = request.body;
    const database = database_.getDb();

    database.run(
        `UPDATE products SET stock = ? WHERE id = ?`,
        [stock, id],
        function(error) {
            if (error) {
                return res.status(500).json({error: 'Failed to update stock'});
            }
            if (this.changes === 0) {
                return res.status(404).json({error: 'Product not found'});
            }
            res.json({success: true});
        }
    );
};