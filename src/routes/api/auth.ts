import express from 'express';
import { getConnection } from "typeorm";
import { User } from '../../entity/User';
import { jwtsign } from '../../lib/token';

const router = express.Router();

router.post('/login', async (req, res) => {
    const { id, password } = req.body;
    let accessToken, status, body, payload;

    const user = await getConnection()
        .createQueryBuilder()
        .select("user")
        .from(User, "user")
        .where("user.id = :id", { id: id })
        .andWhere("user.password = :password", { password: password })
        .getOne();

    if (user !== undefined) {
        payload = { id: user.id, email: user.email, isValidate: user.isValidated };
        accessToken = await jwtsign(payload, '15m')
        status = 201;
        body = { "accessToken": accessToken };
    } else {
        status = 403;
        body = { "errorMessage": "Forbidden" };
    }

    res.status(status).json(body);
});

router.post('/signup', async (req, res) => {
    const { id, email, password } = req.body;
    let status, body;

    if (id === undefined || email === undefined || password === undefined) {
        status = 400;
        body = { "errorMessage": "Bad Request" };
    } else {
        await getConnection()
            .createQueryBuilder()
            .insert()
            .into(User)
            .values({
                id: id,
                email: email,
                password: password
            })
            .execute();

        status = 201;
        body = { "successMessage": "ok" };
    }

    res.status(status).json(body);
});

router.put('/modify', async (req, res) => {
    const { id, email, password } = req.body;
    let status, body;
    
    if (id === undefined || email === undefined || password === undefined) {
        status = 400;
        body = { "errorMessage": "Bad Request" };
    } else {
        await getConnection()
            .createQueryBuilder()
            .update(User)
            .set({
                id: id,
                email: email,
                password: password
            })
            .where("id = :id", {id: id})
            .execute();
        
        status = 200;
        body = { "successMessage": "ok" }
    }

    res.status(status).json(body);
})

router.get('/logout', async (req, res) => {
    res.send('logout');
});

router.put('/token', async (req, res) => {
    res.send('refresh token');
})

export default router;