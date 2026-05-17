// src/pages/api/gold_price.js
import { NextApiRequest, NextApiResponse } from 'next';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    if (req.method !== 'POST') {
        return res.status(405).json({
            error: 'Method not allowed'
        });
    }

    const quantity_grams = req.body.quantity_grams;
    const customer_name = 'Shankar Rao'; // remove this and get it from the request body in the future

    if (!quantity_grams || !customer_name) {
        return res.status(400).json({
            error: 'quantity_grams and customer_name are required'
        });
    }

    try {
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
        const response = await fetch(`${backendUrl}/gold_rate_admin/booking/lock/`,{
            method: 'POST',
            headers: { 'Content-Type':'application/json'},
            body: JSON.stringify({
                quantity_grams,
                customer_name
            })
        });

        if (!response.ok) {
            const error = await response.json();
            return res.status(response.status).json(error);
        }

        const data = await response.json()
        return res.status(200).json(data);
    } catch (error) {
        console.error('Error creating booking lock', error)
        return res.status(500).json({error: 'Failed to create booking'});
    }
}