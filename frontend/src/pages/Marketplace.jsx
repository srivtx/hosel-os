import React, { useState, useEffect } from 'react';
import { ShoppingBag, Tag, Plus, DollarSign, Camera as ImageIcon, Trash2, CheckCircle, Search } from 'lucide-react';
import marketplaceService from '../services/marketplaceService';
import { useAuth } from '../context/AuthContext';

const Marketplace = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('buy'); // buy, sell, my-items
    const [items, setItems] = useState([]);
    const [myItems, setMyItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Form State
    const [newItem, setNewItem] = useState({
        title: '',
        description: '',
        price: '',
        condition: 'Used',
        image_url: ''
    });

    useEffect(() => {
        if (activeTab === 'buy') fetchAvailableItems();
        if (activeTab === 'my-items') fetchMyItems();
    }, [activeTab]);

    const fetchAvailableItems = async () => {
        setLoading(true);
        try {
            const res = await marketplaceService.getAvailableItems();
            setItems(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyItems = async () => {
        setLoading(true);
        try {
            const res = await marketplaceService.getMyItems();
            setMyItems(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateItem = async (e) => {
        e.preventDefault();
        try {
            await marketplaceService.createItem(newItem);
            alert("Item Listed Successfully!");
            setNewItem({ title: '', description: '', price: '', condition: 'Used', image_url: '' });
            setActiveTab('my-items');
        } catch (error) {
            alert("Failed to list item");
        }
    };

    const handleMarkSold = async (id) => {
        try {
            await marketplaceService.markAsSold(id);
            fetchMyItems(); // Refresh
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this listing?")) return;
        try {
            await marketplaceService.deleteItem(id);
            fetchMyItems(); // Refresh
        } catch (error) {
            console.error(error);
        }
    };

    const filteredItems = (items || []).filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                        Student Marketplace
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Buy, sell, and trade with your hostel mates.
                    </p>
                </div>

                <div className="flex bg-card border p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('buy')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'buy' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Browse Items
                    </button>
                    <button
                        onClick={() => setActiveTab('sell')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'sell' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Sell Item
                    </button>
                    <button
                        onClick={() => setActiveTab('my-items')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'my-items' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        My Listings
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="min-h-[400px]">
                {/* BUY TAB */}
                {activeTab === 'buy' && (
                    <div className="space-y-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 text-gray-500" size={20} />
                            <input
                                type="text"
                                placeholder="Search for books, gadgets, furniture..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-card border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary/50 outline-none text-white placeholder:text-gray-500"
                            />
                        </div>

                        {loading ? (
                            <div className="text-center py-20 text-muted-foreground">Loading marketplace...</div>
                        ) : filteredItems.length === 0 ? (
                            <div className="text-center py-20 text-muted-foreground border-2 border-dashed border-white/10 rounded-xl">
                                No items found matching your search.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredItems.map(item => (
                                    <div key={item.id} className="bg-card border border-white/5 rounded-xl overflow-hidden hover:border-white/20 transition-all group shadow-lg shadow-black/20">
                                        <div className="h-48 bg-gray-800 relative overflow-hidden">
                                            {item.image_url ? (
                                                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-gray-600">
                                                    <ImageIcon size={48} />
                                                </div>
                                            )}
                                            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-white border border-white/10 uppercase">
                                                {item.condition}
                                            </div>
                                        </div>
                                        <div className="p-5">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-lg text-white line-clamp-1" title={item.title}>{item.title}</h3>
                                                <div className="text-green-400 font-bold">₹{item.price}</div>
                                            </div>
                                            <p className="text-sm text-gray-400 line-clamp-2 mb-4 h-10">{item.description}</p>

                                            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                                <div className="text-xs text-gray-500">
                                                    <div>From: <span className="text-blue-300 font-medium">{item.seller_name}</span></div>
                                                    <div>Room: <span className="text-gray-300">{item.seller_room}</span></div>
                                                </div>
                                                <button onClick={() => alert(`Please visit Room ${item.seller_room} to contact ${item.seller_name}.`)} className="bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                                                    Contact
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* SELL TAB */}
                {activeTab === 'sell' && (
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-card border border-white/10 rounded-2xl p-8 shadow-2xl">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <Tag className="text-pink-400" /> List an Item
                            </h2>
                            <form onSubmit={handleCreateItem} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Item Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={newItem.title}
                                        onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                                        className="w-full bg-gray-900 border border-white/10 rounded-lg p-3 text-white focus:border-pink-500 outline-none"
                                        placeholder="e.g. Casio Scientific Calculator"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Price (₹)</label>
                                        <input
                                            type="number"
                                            required
                                            value={newItem.price}
                                            onChange={e => setNewItem({ ...newItem, price: e.target.value })}
                                            className="w-full bg-gray-900 border border-white/10 rounded-lg p-3 text-white focus:border-pink-500 outline-none"
                                            placeholder="500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Condition</label>
                                        <select
                                            value={newItem.condition}
                                            onChange={e => setNewItem({ ...newItem, condition: e.target.value })}
                                            className="w-full bg-gray-900 border border-white/10 rounded-lg p-3 text-white focus:border-pink-500 outline-none"
                                        >
                                            <option>New</option>
                                            <option>Like New</option>
                                            <option>Used</option>
                                            <option>Damaged</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Description</label>
                                    <textarea
                                        required
                                        value={newItem.description}
                                        onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                                        className="w-full bg-gray-900 border border-white/10 rounded-lg p-3 text-white focus:border-pink-500 outline-none h-32"
                                        placeholder="Describe the item details..."
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Image URL (Optional)</label>
                                    <input
                                        type="url"
                                        value={newItem.image_url}
                                        onChange={e => setNewItem({ ...newItem, image_url: e.target.value })}
                                        className="w-full bg-gray-900 border border-white/10 rounded-lg p-3 text-white focus:border-pink-500 outline-none"
                                        placeholder="https://image-link.com/pic.jpg"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Paste a direct link to an image.</p>
                                </div>
                                <button type="submit" className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-pink-500/20">
                                    <Plus size={20} /> Post Listing
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* MY ITEMS TAB */}
                {activeTab === 'my-items' && (
                    <div className="space-y-4">
                        {myItems.length === 0 && (
                            <div className="text-center py-20 text-muted-foreground border-2 border-dashed border-white/10 rounded-xl">
                                You haven't listed any items yet.
                            </div>
                        )}
                        {myItems.map(item => (
                            <div key={item.id} className="bg-card border border-white/5 rounded-xl p-4 flex items-center justify-between group hover:border-white/10 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                                        {item.image_url ? (
                                            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon className="w-full h-full p-4 text-gray-600" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">{item.title}</h3>
                                        <div className="text-sm text-gray-400">₹{item.price} • {item.condition}</div>
                                        <div className={`text-xs mt-1 font-bold ${item.status === 'Available' ? 'text-green-400' : 'text-gray-500'}`}>
                                            {item.status.toUpperCase()}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {item.status === 'Available' && (
                                        <button onClick={() => handleMarkSold(item.id)} className="p-2 text-green-400 hover:bg-green-400/10 rounded-full transition-colors" title="Mark as Sold">
                                            <CheckCircle size={20} />
                                        </button>
                                    )}
                                    <button onClick={() => handleDelete(item.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-full transition-colors" title="Delete Listing">
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};



class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Marketplace Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 text-red-500 bg-gray-900 rounded-xl border border-red-500/30">
                    <h2 className="text-xl font-bold mb-2">Something went wrong.</h2>
                    <pre className="text-sm bg-black/50 p-4 rounded overflow-auto">
                        {this.state.error && this.state.error.toString()}
                    </pre>
                </div>
            );
        }
        return this.props.children;
    }
}

export default function MarketplaceWithBoundary() {
    return (
        <ErrorBoundary>
            <Marketplace />
        </ErrorBoundary>
    );
};
