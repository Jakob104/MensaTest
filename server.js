const express = require('express');
const path = require('path');
const session = require('express-session'); 
const bcrypt = require('bcryptjs'); 
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = 3000;

// --- EINSTELLUNGEN ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session
app.use(session({
    secret: 'geheimnisvoller_schluessel_von_papa', 
    resave: false,
    saveUninitialized: false
}));

// Middleware für Login-Daten in Views
app.use((req, res, next) => {
    res.locals.loggedIn = req.session.userId;
    res.locals.userName = req.session.userName;
    next();
});

// Admin Schutz
function requireAdmin(req, res, next) {
    if (req.session.isAdmin) { next(); } else { res.redirect('/login'); }
}

// --- ROUTEN ---

// Public
app.get('/', (req, res) => res.render('index', { title: 'Startseite' }));

app.get('/bestellen', async (req, res) => {
    const products = await prisma.product.findMany();
    res.render('bestellen', { title: 'Snacks', products: products });
});

app.get('/builder', (req, res) => res.render('builder', { title: 'Wunsch-Weckerl' }));

app.get('/wochenplan', async (req, res) => {
    const plan = await prisma.weeklyEntry.findMany({ include: { dish: true } });
    const sorter = { "Montag": 1, "Dienstag": 2, "Mittwoch": 3, "Donnerstag": 4, "Freitag": 5 };
    plan.sort((a, b) => sorter[a.day] - sorter[b.day]);
    res.render('wochenplan', { title: 'Wochenplan', plan: plan });
});

app.get('/warenkorb', (req, res) => res.render('warenkorb', { title: 'Dein Warenkorb' }));
app.get('/checkout', (req, res) => res.render('checkout', { title: 'Abschließen' }));
app.get('/success', (req, res) => res.render('success', { title: 'Bestellung erfolgreich' }));

// User Auth
app.get('/register', (req, res) => res.render('register', { title: 'Account erstellen' }));
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.render('register', { title: 'Registrieren', error: 'Email bereits vergeben!' });
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({ data: { name, email, password: hashedPassword, points: 50 } });
    res.redirect('/login');
});

app.get('/login', (req, res) => res.render('login', { title: 'Login', error: null }));
app.post('/login-user', async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (user && await bcrypt.compare(password, user.password)) {
        req.session.userId = user.id;
        req.session.userName = user.name;
        req.session.isAdmin = false;
        res.redirect('/profile');
    } else {
        res.render('login', { title: 'Login', error: 'Falsche Daten!' });
    }
});
app.get('/logout', (req, res) => { req.session.destroy(); res.redirect('/'); });

// User Profil & Punkte
app.get('/profile', async (req, res) => {
    if (!req.session.userId) return res.redirect('/login');
    const user = await prisma.user.findUnique({
        where: { id: req.session.userId },
        include: { orders: { orderBy: { createdAt: 'desc' } } }
    });
    res.render('profile', { title: 'Mein Profil', user });
});

app.post('/api/redeem', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: "Nicht eingeloggt" });
    const user = await prisma.user.findUnique({ where: { id: req.session.userId } });
    if (user.points >= 300) {
        await prisma.user.update({ where: { id: user.id }, data: { points: user.points - 300 } });
        await prisma.order.create({
            data: {
                customerName: user.name + " (Punkte eingelöst)", totalPrice: 0,
                items: "🎁 GRATIS TREUE-SNACK", status: "NEU", userId: user.id, pickupTime: "Sofort"
            }
        });
        res.json({ success: true });
    } else {
        res.status(400).json({ error: "Nicht genug Punkte" });
    }
});

// Admin Auth
app.post('/login', (req, res) => {
    if (req.body.password === 'mensa123') {
        req.session.isAdmin = true; req.session.userId = null; res.redirect('/admin'); 
    } else {
        res.render('login', { title: 'Admin Login', error: 'Falsches Admin Passwort!' });
    }
});

// Admin Bereich
app.get('/admin', requireAdmin, (req, res) => res.render('admin_dashboard', { title: 'Admin Zentrale' }));
app.get('/admin/orders', requireAdmin, async (req, res) => {
    const orders = await prisma.order.findMany({ orderBy: { createdAt: 'desc' } });
    res.render('admin_orders', { title: 'Admin Übersicht', orders: orders });
});
app.get('/admin/plan', requireAdmin, async (req, res) => {
    const planEntries = await prisma.weeklyEntry.findMany({ include: { dish: true } });
    res.render('admin_plan', { title: 'Wochenplaner', plan: planEntries });
});
app.get('/admin/dishes', requireAdmin, async (req, res) => {
    const dishes = await prisma.dish.findMany({ orderBy: { name: 'asc' } });
    res.render('admin_dishes', { title: 'Gerichte verwalten', dishes: dishes });
});

// Admin API
app.post('/api/dishes/create', requireAdmin, async (req, res) => {
    try { await prisma.dish.create({ data: { name: req.body.name, description: req.body.description, price: parseFloat(req.body.price) } }); res.json({ success: true }); } catch (e) { res.status(500).json({ error: "Fehler" }); }
});
app.post('/api/dishes/delete', requireAdmin, async (req, res) => {
    try { await prisma.dish.delete({ where: { id: parseInt(req.body.id) } }); res.json({ success: true }); } catch (e) { res.status(400).json({ error: "Wird verwendet" }); }
});
app.get('/api/dishes/search', requireAdmin, async (req, res) => {
    const results = await prisma.dish.findMany({ where: { name: { contains: req.query.q } }, take: 5 }); res.json(results);
});
app.post('/api/plan/update', requireAdmin, async (req, res) => {
    const { day, menuType, dishId } = req.body;
    const existing = await prisma.weeklyEntry.findFirst({ where: { day, menuType } });
    if (existing) { await prisma.weeklyEntry.update({ where: { id: existing.id }, data: { dishId: parseInt(dishId) } }); } 
    else { await prisma.weeklyEntry.create({ data: { day, menuType, dishId: parseInt(dishId) } }); }
    res.json({ success: true });
});
app.post('/api/admin/status', requireAdmin, async (req, res) => {
    await prisma.order.update({ where: { id: parseInt(req.body.orderId) }, data: { status: req.body.status } }); res.json({ success: true });
});

// --- API BESTELLEN (STRENGE ZEIT-VALIDIERUNG) ---
app.post('/api/bestellen', async (req, res) => {
    const { customerName, userClass, pickupDate, pickupTime, cart } = req.body;

    if (!cart || cart.length === 0) return res.status(400).json({ error: "Warenkorb leer" });

    // 1. Zeit parsen
    const [hour, minute] = pickupTime.split(':').map(Number);
    const orderDate = new Date(pickupDate);
    const dayOfWeek = orderDate.getDay(); 
    const dayMap = { "Montag": 1, "Dienstag": 2, "Mittwoch": 3, "Donnerstag": 4, "Freitag": 5 };

    // 2. Globale Öffnungszeiten prüfen (7:30 - 14:30)
    // Zu früh? (Stunde kleiner 7 ODER Stunde ist 7 aber Minute kleiner 30)
    if (hour < 7 || (hour === 7 && minute < 30)) {
        return res.status(400).json({ error: "Wir öffnen erst um 07:30 Uhr!" });
    }
    // Zu spät? (Stunde größer 14 ODER Stunde ist 14 aber Minute größer 30)
    if (hour > 14 || (hour === 14 && minute > 30)) {
        return res.status(400).json({ error: "Abholung nur bis 14:30 Uhr möglich!" });
    }

    // 3. Warenkorb auf Mittagessen prüfen
    for (const item of cart) {
        if (item.type === 'lunch') {
            
            // REGEL A: Mittagessen erst ab 11:00!
            if (hour < 11) {
                return res.status(400).json({ 
                    error: `Das Mittagessen (${item.name}) ist erst ab 11:00 Uhr fertig!` 
                });
            }

            // REGEL B: Wochentag muss stimmen
            const requiredDay = dayMap[item.day];
            if (requiredDay && requiredDay !== dayOfWeek) {
                return res.status(400).json({ 
                    error: `Das Gericht '${item.name}' gibt es nur am ${item.day}. Dein gewähltes Datum passt nicht.` 
                });
            }
        }
    }

    // 4. Alles ok -> Speichern
    let total = 0;
    const itemStrings = [];
    for (const item of cart) {
        total += item.price * item.quantity;
        itemStrings.push(`${item.quantity}x ${item.name}`);
    }
    const pointsEarned = Math.floor(total * 10);

    try {
        const newOrder = await prisma.order.create({
            data: {
                customerName, userClass, pickupDate, pickupTime, totalPrice: total,
                items: itemStrings.join(', '), status: "NEU",
                userId: req.session.userId ? req.session.userId : null 
            }
        });

        if (req.session.userId) {
            await prisma.user.update({
                where: { id: req.session.userId },
                data: { points: { increment: pointsEarned } }
            });
        }
        res.json({ success: true, orderId: newOrder.id });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Server Fehler" });
    }
});

app.listen(PORT, () => { console.log(`🚀 Server läuft auf http://localhost:${PORT}`); });