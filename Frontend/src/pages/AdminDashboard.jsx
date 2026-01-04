//frontend/src/pages/AdminDashboard.jsx

import { useEffect, useState } from "react";
import axios from "../api/axios";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { RefreshCw, Download, Send, MessageCircle, Users } from "lucide-react";
import ChatComponent from "../components/ChatComponent";

import CourseVideos from "../components/CourseVideos";
import socket from "../components/socket";

export default function AdminDashboard() {
  const [loading, setLoading] = useState({ stats: true, sales: true, affiliates: true, courses: true, contacts: true });
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({});
  const [sales, setSales] = useState([]);
  const [affiliates, setAffiliates] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [courses, setCourses] = useState([]);

  const [activeUsers, setActiveUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [replyMessage, setReplyMessage] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [adminName, setAdminName] = useState('Admin');
  const [currentRoom, setCurrentRoom] = useState('general');
  const [onlineUsers, setOnlineUsers] = useState([]);

  const adminRoom = 'general';


  const [videos, setVideos] = useState([]);
  const handleAddVideo = (video) => {
    setVideos([...videos, video]);
  };


  // 1. Initial data fetch
  useEffect(() => {
    fetchDashboard();
    axios.get('/admin/purchased-users')
      .then(res => {
        setActiveUsers((res.data.users || []).map(u => ({
          ...u,
          id: u._id,
          userName: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email
        })));
      })
      .catch(console.error);

    axios.get(`/admin/chat/messages?room=${adminRoom}&limit=50`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => setChatMessages(res.data.messages || []))
      .catch(console.error);

    socket.emit('joinRoom', { room: adminRoom, userName: adminName });
    socket.emit('addUser', { userName: adminName, id: 'admin' });

  }, []); // ← runs once on mount

  // 2. Socket listeners (top-level, separate useEffect)
  useEffect(() => {
    const handleReceiveMessage = (data) => {
      if (data.room === currentRoom) setChatMessages(prev => [...prev, data]);
    };
    const handleAdminMessage = (data) => {
      setChatMessages(prev => [...prev, { ...data, userName: 'Admin Broadcast', isBroadcast: true }]);
    };
    const handleActiveUsers = (users) => {
      setOnlineUsers(users.filter(u => u.userName !== 'Admin').map(u => ({ ...u, id: u.id || u._id })));
    };

    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('adminMessage', handleAdminMessage);
    socket.on('activeUsers', handleActiveUsers);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('adminMessage', handleAdminMessage);
      socket.off('activeUsers', handleActiveUsers);
    };
  }, [currentRoom]); // ← currentRoom pe depend kare




  const fetchDashboard = async () => {
    console.log("[AdminDashboard] Fetching dashboard data...");
    try {
      setLoading({ stats: true, sales: true, affiliates: true, courses: true, contacts: true });
      console.log("[AdminDashboard] Making API requests...");
      const [statsRes, salesRes, affiliatesRes, coursesRes, contactsRes] = await Promise.all([
        axios.get("/admin/dashboard"),
        axios.get("/admin/sales"),
        axios.get("/admin/affiliates"),
        axios.get("/admin/courses"),
        axios.get("/admin/contacts"),
      ]);

      console.log("[AdminDashboard] API responses:", {
        stats: statsRes.data,
        salesCount: salesRes.data.length,
        affiliatesCount: affiliatesRes.data.length,
        coursesCount: coursesRes.data.length,
        contactsCount: contactsRes.data.length,
        courses: coursesRes.data.map((c) => ({ id: c._id, name: c.title })),
      });
      setStats(statsRes.data || {});
      setSales(salesRes.data || []);
      setAffiliates(affiliatesRes.data || []);
      setCourses(coursesRes.data || []);
      setContacts(contactsRes.data || []);
    } catch (err) {
      console.error("[AdminDashboard] Error loading dashboard data:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading({ stats: false, sales: false, affiliates: false, courses: false, contacts: false });
      console.log("[AdminDashboard] Data fetching completed, loading states updated.");
    }
  };

  const handleExportCSV = () => {
    console.log("[AdminDashboard] Exporting CSV...");

    const formatNumber = (num) => Number(num || 0).toFixed(2);

    const csv = [
      "Data,Value",
      `Total Sales,${formatNumber(stats.totalSales)}`,
      `Commission Paid,${formatNumber(stats.totalCommission)}`,
      `Platform Earnings,${formatNumber((stats.totalSales || 0) - (stats.totalCommission || 0))}`,
      `Total Affiliates,${stats.totalAffiliates || 0}`,
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "admin_dashboard_stats.csv";
    a.click();
    window.URL.revokeObjectURL(url);

    console.log("[AdminDashboard] CSV exported successfully");
  };

  const handleBroadcast = () => {
    if (broadcastMessage.trim()) {
      const payload = {
        room: adminRoom,
        message: broadcastMessage,
        userName: adminName,
        timestamp: Date.now()
      };
      console.log("[Admin → Server] Broadcasting message:", payload);
      socket.emit('adminBroadcast', payload);
      setChatMessages(prev => [...prev, { ...payload, userName: adminName, message: broadcastMessage }]);
      setBroadcastMessage('');
    } else {
      console.warn("[AdminDashboard] Empty broadcast message, not sent");
    }
  };

  const handleReply = () => {
    if (replyMessage.trim() && selectedUser && selectedUser._id) {
      const privateRoom = `private_${selectedUser._id}`;
      const payload = {
        room: privateRoom,
        message: replyMessage,
        userName: adminName,
        timestamp: Date.now()
      };
      console.log('🔍 [Admin Frontend] Reply emit payload:', payload);  // ← Payload log
      console.log('🔍 [Admin Frontend] Current socket ID:', socket.id);  // ← Socket status
      socket.emit('adminReply', payload, (ack) => {
        console.log('📤 [Admin Frontend] Server ACK for reply:', ack ? 'Success' : 'No ACK');
      });
      // Local add...
      setChatMessages(prev => [...prev, { ...payload, userName: adminName, message: replyMessage }]);
      setReplyMessage('');
    } else {
      console.warn('⚠️ [Admin Frontend] Reply invalid:', { replyMessage: !!replyMessage.trim(), selectedUser: !!selectedUser, userId: selectedUser?._id });
    }
  };

  const selectUser = (user) => {
    if (!user._id) return alert('Invalid user selected!');

    const privateRoom = `private_${user._id}`;
    setSelectedUser(user);
    setCurrentRoom(privateRoom);

    socket.emit('joinRoom', { room: privateRoom, userName: adminName });

    axios.get(`/chat/messages?room=${privateRoom}&limit=50`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => setChatMessages(res.data.messages || []))
      .catch(err => console.error('Private messages error:', err.response?.data || err.message));
  };



  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchDashboard} disabled={Object.values(loading).some(Boolean)}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
        </div>
      </div>

      {error && <div className="text-red-500 bg-red-100 p-2 rounded">{error}</div>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm">Total Sales</p>
            <p className="text-xl font-bold">₹{stats.totalSales || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm">Commission Paid</p>
            <p className="text-xl font-bold">₹{stats.totalCommission || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm">Platform Earnings</p>
            <p className="text-xl font-bold">₹{(stats.totalSales || 0) - (stats.totalCommission || 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm">Affiliates</p>
            <p className="text-xl font-bold">{stats.totalAffiliates || 0}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sales">
        <TabsList>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="affiliates">Affiliates</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="contacts">Contact Messages</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
        </TabsList>
        <TabsContent value="videos">
          <CourseVideos videos={videos} onAddVideo={handleAddVideo} />
        </TabsContent>

        <TabsContent value="sales">
          {loading.sales ? (
            <div className="text-center">Loading sales...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Affiliate</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((s) => (
                  <TableRow key={s._id}>
                    <TableCell>{new Date(s.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{s.user?.firstName || 'N/A'} ({s.user?.email || 'N/A'})</TableCell>
                    <TableCell>{s.courseName || 'N/A'}</TableCell>
                    <TableCell>₹{s.amount || 0}</TableCell>
                    <TableCell>₹{s.commissionEarned || 0}</TableCell>
                    <TableCell>{s.referredBy?.firstName || 'N/A'}</TableCell>
                    <TableCell>{s.status || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent value="affiliates">
          {loading.affiliates ? (
            <div className="text-center">Loading affiliates...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Sales</TableHead>
                  <TableHead>Total Commission</TableHead>
                  <TableHead>Last Sale</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {affiliates.map((a) => (
                  <TableRow key={a._id}>
                    <TableCell>{`${a.firstName || 'N/A'} ${a.lastName || ''}`}</TableCell>
                    <TableCell>{a.email || 'N/A'}</TableCell>
                    <TableCell>{a.salesCount || 0}</TableCell>
                    <TableCell>₹{a.totalCommission || 0}</TableCell>
                    <TableCell>{a.lastSaleAt ? new Date(a.lastSaleAt).toLocaleDateString() : 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent value="courses">
          {loading.courses ? (
            <div className="text-center">Loading courses...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Sales</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Commission</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((c) => (
                  <TableRow key={c._id}>
                    <TableCell>{c.name || 'N/A'}</TableCell>
                    <TableCell>{c.salesCount || 0}</TableCell>
                    <TableCell>₹{c.totalRevenue || 0}</TableCell>
                    <TableCell>₹{c.totalCommission || 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>
        <TabsContent value="contacts">
          {loading.contacts ? (
            <div className="text-center">Loading contact messages...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((c) => (
                  <TableRow key={c._id}>
                    <TableCell>{new Date(c.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{c.name || 'N/A'}</TableCell>
                    <TableCell>{c.email || 'N/A'}</TableCell>
                    <TableCell>{c.subject || 'N/A'}</TableCell>
                    <TableCell>{c.message || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>



        <TabsContent value="chat" className="flex gap-4">
          <ChatComponent
            selectedUser={selectedUser}
            adminName={adminName}
            token={localStorage.getItem('token')}
            onSelectUser={selectUser}
            onlineUsers={onlineUsers}
            chatMessages={chatMessages}
            onReply={(msg) => setChatMessages(prev => [...prev, { userName: adminName, message: msg, timestamp: Date.now(), senderId: 'admin' }])}
            onBroadcast={(msg) => setChatMessages(prev => [...prev, { userName: adminName, message: msg, timestamp: Date.now(), isBroadcast: true }])}
            replyMessage={replyMessage}
            setReplyMessage={setReplyMessage}
            broadcastMessage={broadcastMessage}
            setBroadcastMessage={setBroadcastMessage}
          />
        </TabsContent>


      </Tabs>
    </div>
  );
}

export { AdminDashboard };