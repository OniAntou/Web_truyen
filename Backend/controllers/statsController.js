const { Comic, User, Chapter, Payment, mongoose } = require('../Database/database');
const asyncHandler = require('../middleware/asyncHandler');
const { resolveR2Url } = require('../config/r2');

const getStats = asyncHandler(async (req, res) => {
  const comicCount = await Comic.countDocuments();
  const userCount = await User.countDocuments();
  const chapterCount = await Chapter.countDocuments();

  const comics = await Comic.find().lean();
  let totalViews = 0;
  comics.forEach((c) => {
    totalViews += (c.views || 0);
  });

  // Calculate total revenue from successful payments
  const totalRevResult = await Payment.aggregate([
    { $match: { status: 'success' } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);
  const totalRevenue = totalRevResult.length > 0 ? totalRevResult[0].total : 0;

  // Get revenue history for the last 7 days
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  // Fetch only the payments from the last 14 days
  const recentPayments = await Payment.find({
    status: 'success',
    created_at: { $gte: fourteenDaysAgo }
  }).lean();

  // Current period revenue (last 7 days)
  const currentPeriodPayments = recentPayments.filter(p => new Date(p.created_at) >= sevenDaysAgo);
  const currentRevenue = currentPeriodPayments.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  // Previous period revenue (7-14 days ago)
  const previousPeriodPayments = recentPayments.filter(p => new Date(p.created_at) >= fourteenDaysAgo && new Date(p.created_at) < sevenDaysAgo);
  const previousRevenue = previousPeriodPayments.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  // Calculate trend (%)
  let revenueTrend = 0;
  if (previousRevenue > 0) {
    revenueTrend = (((currentRevenue - previousRevenue) / previousRevenue) * 100).toFixed(1);
  } else if (currentRevenue > 0) {
    revenueTrend = 100; // 100% up if previous was 0
  }

  const revenueHistory = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    
    const dayTotal = currentPeriodPayments
      .filter(p => {
         const pDate = new Date(p.created_at);
         const pDateString = new Date(pDate.getTime() - pDate.getTimezoneOffset() * 60000).toISOString().split('T')[0];
         return pDateString === dateString;
      })
      .reduce((acc, curr) => acc + (curr.amount || 0), 0);
    
    revenueHistory.push({
      date: dateString,
      amount: dayTotal
    });
  }

  const formatViews = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  // System Health
  // Top Performing Comics - Use raw collection to bypass Mongoose schema strips
  const topComicsRaw = await Comic.collection.find().sort({ views: -1 }).limit(5).toArray();
  
  const topComics = await Promise.all(topComicsRaw.map(async c => {
    try {
      const coverUrl = c.cover_url || c.cover;
      const cover = await resolveR2Url(coverUrl);
      return { 
        ...c, 
        _id: c._id.toString(),
        cover: cover || coverUrl || "https://via.placeholder.com/300x400?text=No+Cover" 
      };
    } catch (err) {
      return { 
        ...c, 
        _id: c._id.toString(),
        cover: c.cover_url || c.cover || "https://via.placeholder.com/300x400?text=No+Cover" 
      };
    }
  }));

  // Recent Comics
  const recentComicsRaw = await Comic.collection.find().sort({ createdAt: -1 }).limit(5).toArray();
  const recentComics = await Promise.all(recentComicsRaw.map(async c => {
    try {
      const coverUrl = c.cover_url || c.cover;
      const cover = await resolveR2Url(coverUrl);
      return { 
        ...c, 
        _id: c._id.toString(),
        cover: cover || coverUrl || "https://via.placeholder.com/300x400?text=No+Cover" 
      };
    } catch (err) {
      return { 
        ...c, 
        _id: c._id.toString(),
        cover: c.cover_url || c.cover || "https://via.placeholder.com/300x400?text=No+Cover" 
      };
    }
  }));

  // Force Healthy if we got data
  const dbStatus = (topComicsRaw.length > 0) ? 'Healthy' : 'Disconnected';

  res.json({
    totalComics: comicCount,
    totalViews: formatViews(totalViews),
    totalUsers: userCount,
    totalChapters: chapterCount,
    totalRevenue,
    revenueTrend: (revenueTrend >= 0 ? "+" : "") + revenueTrend + "%",
    revenueHistory,
    previousRevenueHistory: (() => {
      const history = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - (i + 7));
        const dateString = date.toLocaleDateString();
        
        const dayTotal = previousPeriodPayments
          .filter(p => new Date(p.created_at).toLocaleDateString() === dateString)
          .reduce((acc, curr) => acc + curr.amount, 0);
        
        history.push({
          date: date.toISOString().split('T')[0],
          amount: dayTotal
        });
      }
      return history;
    })(),
    topComics,
    recentComics,
    systemHealth: {
      database: dbStatus,
      server: 'Active',
      uptime: process.uptime()
    }
  });
});

module.exports = {
  getStats
};


