import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Plus, Filter, Star, Trash2, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { resolveMediaUrl } from '../../services/media';
import type { MenuItemDTO } from '../../services/types';
import { Button, Input, Modal, Badge, ImageUpload } from '../../components/ui';
import { toast } from '../../store/toastStore';
import i18n from '../../i18n';
import { translateCategoryName } from '../../utils/menuCategories';
import { formatVndCurrency } from '../../utils/formatters';
import { DEFAULT_FALLBACK_IMAGE_URL } from '../../services/media';

export const AdminMenuCatalogView = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState<MenuItemDTO[]>([]);
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<{ id: string, name: string, icon?: string, color?: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', categoryId: '', imageUrl: '' });
  const [loading, setLoading] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItemDTO | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItemDTO | null>(null);
  const [editForm, setEditForm] = useState({ name: '', description: '', price: '', imageUrl: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  const fetchMenu = () => {
    api.get('/menu?page=0&size=50').then((res) => {
      const responseData = res.data.data;
      const data = (responseData && typeof responseData === 'object' && 'items' in responseData)
        ? responseData.items
        : responseData;

      setItems(Array.isArray(data) ? data : []);
    }).catch(() => {
      setItems([]);
      toast.error(t('adminMenu.loadError'));
    });
  };

  useEffect(() => {
    fetchMenu();
    api.get('/categories').then((res) => {
      if (res.data.data) setCategories(res.data.data);
    }).catch((error: Error) => {
      console.error('Failed to fetch categories:', error);
    });
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/menu', {
        ...formData,
        price: parseFloat(formData.price),
      });
      const newItemId = response.data.data.id;

      if (selectedImageFile) {
        const imageFormData = new FormData();
        imageFormData.append('file', selectedImageFile);

        await api.post(`/menu/${newItemId}/image`, imageFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      toast.success(t('adminMenu.created'));
      setIsModalOpen(false);
      setFormData({ name: '', description: '', price: '', categoryId: '', imageUrl: '' });
      setSelectedImageFile(null);
      fetchMenu();
    } catch {
      toast.error(t('adminMenu.createError'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(t('adminMenu.confirmDelete', { name }))) return;

    try {
      await api.delete(`/menu/${id}`);
      toast.success(t('adminMenu.deleted', { name }));
      fetchMenu();
    } catch {
      toast.error(t('adminMenu.deleteError'));
    }
  };

  const handleEditSave = async () => {
    if (!editingItem) return;

    setEditLoading(true);
    try {
      await api.put(`/menu/${editingItem.id}`, {
        name: editForm.name.trim() || editingItem.name,
        description: editForm.description !== '' ? editForm.description : editingItem.description,
        price: editForm.price ? parseFloat(editForm.price) : editingItem.price,
        imageUrl: editForm.imageUrl.trim() || editingItem.imageUrl,
        isAvailable: editingItem.isAvailable,
        categoryId: editingItem.categoryId,
        preparationTime: editingItem.preparationTime,
      });
      toast.success(t('adminMenu.updated'));
      setEditingItem(null);
      setEditForm({ name: '', description: '', price: '', imageUrl: '' });
      fetchMenu();
    } catch {
      toast.error(t('adminMenu.updateError'));
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditImageUploaded = (imageUrl: string) => {
    if (!editingItem) return;

    setEditingItem((prev) => prev ? { ...prev, imageUrl } : prev);
    setSelectedItem((prev) => prev && prev.id === editingItem.id ? { ...prev, imageUrl } : prev);
    setItems((prev) => prev.map((item) => item.id === editingItem.id ? { ...item, imageUrl } : item));
    fetchMenu();
  };

  const filtered = search
    ? items.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
    : selectedCategory
      ? items.filter((item) => item.categoryId === selectedCategory)
      : items;

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1>{t('adminMenu.title')}</h1>
          <p>{t('adminMenu.subtitle')}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Input
            type="text"
            placeholder={t('adminMenu.searchPlaceholder')}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedCategory(null);
            }}
            icon={<Search size={16} />}
            style={{ width: '240px', paddingLeft: '36px' }}
          />
          <Button variant="secondary" size="medium" onClick={() => setShowFilter(!showFilter)}>
            <Filter size={16} /> {showFilter ? t('adminMenu.hideFilter') : t('adminMenu.filter')}
          </Button>
          <Button variant="primary" size="medium" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> {t('adminMenu.addItem')}
          </Button>
        </div>
      </div>

      {showFilter && categories.length > 0 && (
        <div
          style={{
            display: 'flex',
            gap: 'var(--sp-2)',
            marginBottom: 'var(--sp-6)',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <Tag size={16} style={{ color: 'var(--text-muted)' }} />
          <Button
            variant={!selectedCategory ? 'primary' : 'outline'}
            size="small"
            onClick={() => setSelectedCategory(null)}
          >
            {t('adminMenu.all')}
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'primary' : 'outline'}
              size="small"
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                borderColor: cat.color || undefined,
                color: cat.color || undefined,
              }}
            >
              {cat.icon && <span style={{ marginRight: '4px' }}>{cat.icon}</span>}
              {translateCategoryName(cat.name, i18n.language)}
            </Button>
          ))}
        </div>
      )}

      <div className="item-grid">
        {filtered.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ y: -4, boxShadow: 'var(--shadow-lg)' }}
            transition={{ duration: 0.2 }}
          >
            <div
              style={{
                borderRadius: 'var(--r-lg)',
                overflow: 'hidden',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-main)',
                transition: 'all 250ms var(--ease-out)',
              }}
            >
              <div style={{ position: 'relative', overflow: 'hidden', height: '200px' }}>
                <img
                  src={resolveMediaUrl(item.imageUrl, DEFAULT_FALLBACK_IMAGE_URL)}
                  alt={item.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: item.isAvailable ? 'none' : 'grayscale(70%) brightness(0.7)',
                    transition: 'transform 300ms ease',
                  }}
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (img.src !== DEFAULT_FALLBACK_IMAGE_URL) {
                      img.src = DEFAULT_FALLBACK_IMAGE_URL;
                    }
                  }}
                  onMouseEnter={(e) => {
                    if (item.isAvailable) (e.target as HTMLImageElement).style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLImageElement).style.transform = 'scale(1)';
                  }}
                />
                <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                  <Badge variant={item.isAvailable ? 'success' : 'error'} size="small">
                    {item.isAvailable ? t('adminMenu.available') : t('adminMenu.outOfStock')}
                  </Badge>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id, item.name);
                  }}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--r-full)',
                    background: 'rgba(255,100,100,0.9)',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                  }}
                  title="Delete item"
                >
                  <Trash2 size={16} />
                </motion.button>
              </div>
              <div style={{ padding: 'var(--sp-4)' }}>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                  {translateCategoryName(item.categoryName, i18n.language)}
                </div>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: '12px', lineHeight: 1.3 }}>{item.name}</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--orange-600)' }}>{formatVndCurrency(Number(item.price || 0), i18n.language)}</span>
                  <div style={{ display: 'flex', gap: '2px', color: 'var(--amber)' }}>
                    {[1, 2, 3, 4, 5].map((rating) => <Star key={rating} size={14} fill={rating <= 4 ? 'currentColor' : 'none'} />)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: 'var(--sp-3)' }}>
                  <Button variant="secondary" size="small" style={{ flex: 1 }} onClick={() => setEditingItem(item)}>{t('adminMenu.edit')}</Button>
                  <Button variant="outline" size="small" style={{ flex: 1 }} onClick={() => setSelectedItem(item)}>{t('adminMenu.view')}</Button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <Modal title={t('adminMenu.addTitle')} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="medium">
        <form id="menu-form" onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          <div>
            <Input
              label={t('adminMenu.name')}
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t('adminMenu.namePlaceholder')}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
            <Input
              label={t('adminMenu.price')}
              type="number"
              required
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="0.00"
            />
            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--sp-1)', color: 'var(--text-heading)' }}>{t('adminMenu.category')}</label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--r-md)',
                  border: '1px solid var(--border-main)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                <option value="">{t('adminMenu.selectCategory')}</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{translateCategoryName(category.name, i18n.language)}</option>)}
              </select>
            </div>
          </div>
          <ImageUpload
            currentImageUrl={formData.imageUrl || undefined}
            onImageUpload={(url) => setFormData({ ...formData, imageUrl: url })}
            onFileSelect={(file) => setSelectedImageFile(file)}
            shape="rounded"
            size="lg"
            label={t('adminMenu.itemImage')}
          />
          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--sp-1)', color: 'var(--text-heading)' }}>{t('adminMenu.description')}</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('adminMenu.descriptionPlaceholder')}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--r-md)',
                border: '1px solid var(--border-main)',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-main)',
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-sans)',
                resize: 'vertical',
              }}
            />
          </div>
          <Button type="submit" variant="primary" size="medium" disabled={loading} style={{ marginTop: 'var(--sp-2)', width: '100%' }}>
            {loading ? t('adminMenu.saving') : t('adminMenu.saveItem')}
          </Button>
        </form>
      </Modal>

      <Modal title={t('adminMenu.detailsTitle')} isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} size="medium">
        {selectedItem && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
            <img
              src={resolveMediaUrl(selectedItem.imageUrl, DEFAULT_FALLBACK_IMAGE_URL)}
              alt={selectedItem.name}
              style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: 'var(--r-md)' }}
              onError={(e) => {
                const img = e.currentTarget;
                if (img.src !== DEFAULT_FALLBACK_IMAGE_URL) {
                  img.src = DEFAULT_FALLBACK_IMAGE_URL;
                }
              }}
            />
            <div>
              <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: '4px' }}>{selectedItem.name}</h3>
              <Badge variant={selectedItem.isAvailable ? 'success' : 'error'} size="small">
                {selectedItem.isAvailable ? t('adminMenu.available') : t('adminMenu.outOfStock')}
              </Badge>
            </div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
              <strong>{t('adminMenu.category')}:</strong> {translateCategoryName(selectedItem.categoryName, i18n.language)}
            </div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
              <strong>{t('adminMenu.prepTime')}:</strong> {selectedItem.preparationTime || 'N/A'} {t('adminMenu.minutes')}
            </div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
              <strong>{t('adminMenu.description')}:</strong> {selectedItem.description || t('adminMenu.noDescription')}
            </div>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--orange-600)' }}>
              {formatVndCurrency(Number(selectedItem.price || 0), i18n.language)}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title={t('adminMenu.editTitle')}
        isOpen={!!editingItem}
        onClose={() => {
          setEditingItem(null);
          setEditForm({ name: '', description: '', price: '', imageUrl: '' });
        }}
        size="medium"
      >
        {editingItem && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
            <Input
              label={t('adminMenu.name')}
              defaultValue={editingItem.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              placeholder={t('adminMenu.namePlaceholder')}
            />
            <Input
              label={t('adminMenu.price')}
              type="number"
              step="0.01"
              defaultValue={editingItem.price}
              onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
              placeholder="0.00"
            />
            <ImageUpload
              currentImageUrl={editingItem.imageUrl || undefined}
              onImageUpload={handleEditImageUploaded}
              uploadEndpoint={`/menu/${editingItem.id}/image`}
              shape="rounded"
              size="lg"
              label={t('adminMenu.itemImage')}
            />
            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--sp-1)', color: 'var(--text-heading)' }}>{t('adminMenu.description')}</label>
              <textarea
                rows={3}
                defaultValue={editingItem.description || ''}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder={t('adminMenu.descriptionPlaceholder')}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--r-md)',
                  border: '1px solid var(--border-main)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-sans)',
                  resize: 'vertical',
                }}
              />
            </div>
            <Button variant="primary" size="medium" onClick={handleEditSave} disabled={editLoading} style={{ width: '100%' }}>
              {editLoading ? t('adminMenu.saving') : t('adminMenu.saveChanges')}
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};
