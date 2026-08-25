/**
 * MyPlanePicsSuite Component
 * Liquid Glass & 3D Aircraft Photo Album, Filename Parser,
 * Spotter Ranking Leaderboard, and Analytics & Statistics.
 * Enhanced with 3D depth effects, liquid glassmorphism, and intuitive UX.
 */

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { parsePlaneFilename } from '../../utils/planePicsParser';
import {
  computeLiveStats,
} from '../../data/planePicsData';
import { PlanePhoto } from '../../types';
import { encryptionService } from '../../utils/crypto';
import {
  Camera,
  FileCode,
  Award,
  BarChart3,
  Search,
  Plus,
  Lock,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  Calendar,
  Layers,
  Flame,
  X,
  Upload,
  ChevronRight,
  Eye,
  Tag,
  Maximize2,
  Info,
  Check,
  RefreshCw,
  SlidersHorizontal,
  Folder as FolderIcon,
  Video,
  ArrowLeft,
  ArrowRight,
  Trash2,
  Copy,
  Download,
  Grid3x3,
  List,
  Sun,
  Contrast,
  Palette,
  Wand2,
  FolderOpen,
  Tag as TagsIcon,
  Edit3,
  Share2,
  FileDown,
  Globe,
  Bookmark,
  Star,
  FileText,
} from 'lucide-react';

const generateThumbnail = (file: File, maxWidth = 400, maxHeight = 300): Promise<string> => {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ratio = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
      canvas.width = Math.max(1, Math.floor(img.width * ratio));
      canvas.height = Math.max(1, Math.floor(img.height * ratio));
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve('');
    };
    img.src = url;
  });
};

export const MyPlanePicsSuite: React.FC = () => {
  const { showToast, user, t, myPlanePics, setMyPlanePics } = useApp();

  const processFilesInChunks = useCallback(async (
    files: File[],
    onProgress: (progress: number, status: string) => void,
    isPermanent: boolean
  ): Promise<PlanePhoto[]> => {
    const results: PlanePhoto[] = [];
    const total = files.length;
    const chunkSize = 32;
    const userFolder = files[0]?.webkitRelativePath?.split('/')[0] || '';

    for (let i = 0; i < total; i += chunkSize) {
      const chunk = files.slice(i, i + chunkSize);

      const chunkResults = await Promise.all(chunk.map(async (file, idx) => {
        const globalIndex = i + idx;
        const parsedFilename = parsePlaneFilename(file.name);
        const isVideo = file.type.startsWith('video/');

        onProgress(Math.round(((globalIndex) / total) * 100), `Parsing ${file.name} (${globalIndex + 1}/${total})`);

        const relPath = file.webkitRelativePath || file.name;
        const pathParts = relPath.split(/[/\\]/);

        let extractedAirline = 'Vault Import';
        let extractedAircraft = parsedFilename.isRangeFormat ? 'Military Aircraft Range' : 'Commercial Airliner';

        if (pathParts.length >= 4) {
          extractedAirline = pathParts[1].trim() || 'Vault Import';
          extractedAircraft = pathParts[2].trim() || extractedAircraft;
        } else if (pathParts.length === 3) {
          extractedAirline = pathParts[1].trim() || 'Vault Import';
        }

        const dataUrl = URL.createObjectURL(file);

        const thumbnailUrl = !isVideo ? await generateThumbnail(file) : '';

        const encryptedPayload = await encryptionService.encrypt(
          JSON.stringify({
            notes: `Path: ${relPath}`,
            size: file.size,
            lastModified: file.lastModified,
            timestamp: new Date().toISOString(),
          })
        );

        return {
          id: `photo-${Date.now()}-${globalIndex}-${Math.random().toString(36).substring(2, 6)}`,
          filename: parsedFilename.filename,
          imageUrl: dataUrl || 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&fit=crop',
          mediaType: isVideo ? 'video' : 'image',
          videoUrl: isVideo ? dataUrl : undefined,
          thumbnailUrl: thumbnailUrl || undefined,
          registration: parsedFilename.registration,
          specialLivery: parsedFilename.specialLivery,
          dateCaptured: parsedFilename.dateCaptured,
          formattedDate: parsedFilename.formattedDate,
          shotNumber: parsedFilename.shotNumber || undefined,
          formatPattern: parsedFilename.formatPattern,
          isRangeFormat: parsedFilename.isRangeFormat,
          isAutoCorrected: parsedFilename.isAutoCorrected,
          location: pathParts[0],
          aircraftModel: extractedAircraft,
          airline: extractedAirline,
          spotterName: user?.username || 'Captain Spotter',
          isEncrypted: true,
          encryptedData: encryptedPayload,
          rating: 5,
          notes: `Imported from path: ${relPath}`,
        } as PlanePhoto;
      }));

      results.push(...chunkResults);
      onProgress(Math.round(((i + chunkSize) / total) * 100), `Processed ${Math.min(i + chunkSize, total)}/${total} files`);
    }

    return results;
  }, [user]);

  // Active Tab: album, parser, ranking, collections
  const [activeTab, setActiveTab] = useState<'album' | 'parser' | 'ranking' | 'collections'>('album');

  // Hidden Inputs for Single & Folder Upload
  const singleInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);

  // Photo Upload Metadata Modal State
  const [pendingUploadFile, setPendingUploadFile] = useState<File | null>(null);
  const [showUploadMetadataModal, setShowUploadMetadataModal] = useState(false);
  const [uploadFormData, setUploadFormData] = useState({
    registration: '',
    airline: '',
    aircraftModel: '',
    specialLivery: '',
    dateCaptured: '',
  });

  // Folder Storage Strategy Modal State
  const [pendingFolderFiles, setPendingFolderFiles] = useState<File[]>([]);
  const [showFolderChoiceModal, setShowFolderChoiceModal] = useState(false);
  const [showFolderStructureModal, setShowFolderStructureModal] = useState(false);

  // Import Progress State
  const [importProgress, setImportProgress] = useState<number>(0);
  const [importStatusText, setImportStatusText] = useState<string>('');
  const [isImporting, setIsImporting] = useState(false);
  const [processedPaths, setProcessedPaths] = useState<Set<string>>(new Set());

  // Photo Collection State
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxMedia, setLightboxMedia] = useState<PlanePhoto | null>(null);

  // Image Enhancement State
  type EnhancementPreset = 'none' | 'natural' | 'vibrant' | 'film' | 'bw' | 'warm' | 'cool';
  const [enhancePreset, setEnhancePreset] = useState<EnhancementPreset>('none');
  const [enhanceBrightness, setEnhanceBrightness] = useState(100);
  const [enhanceContrast, setEnhanceContrast] = useState(100);
  const [enhanceSaturation, setEnhanceSaturation] = useState(100);
  const [enhanceSepia, setEnhanceSepia] = useState(0);
  const [enhanceHue, setEnhanceHue] = useState(0);
  const [showEnhancePanel, setShowEnhancePanel] = useState(false);
  const [globalEnhance, setGlobalEnhance] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFormat, setFilterFormat] = useState<string>('all');
  const [filterAirline, setFilterAirline] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'registration' | 'airline'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Collections & Tags
  const [collections, setCollections] = useState<string[]>(['Favorites', 'Military', 'Commercial', 'Spotting Log']);
  const [selectedCollection, setSelectedCollection] = useState<string>('all');
  const [newCollectionName, setNewCollectionName] = useState('');
  const [showCreateCollection, setShowCreateCollection] = useState(false);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [showTagEditor, setShowTagEditor] = useState(false);
  const [editingTagsForId, setEditingTagsForId] = useState<string | null>(null);

  // Batch Edit State
  const [showBatchEdit, setShowBatchEdit] = useState(false);
  const [batchAirline, setBatchAirline] = useState('');
  const [batchLocation, setBatchLocation] = useState('');
  const [batchRating, setBatchRating] = useState<number | null>(null);

  // Export State
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Photo Notes Edit State
  const [editingNotesForId, setEditingNotesForId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState('');

  // Paging state
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(12);

  const getEnhancementFilter = useCallback(() => {
    const presetFilters: Record<EnhancementPreset, { brightness?: number; contrast?: number; saturate?: number; sepia?: number; hueRotate?: number }> = {
      none: {},
      natural: { brightness: 105, contrast: 105, saturate: 100 },
      vibrant: { brightness: 110, contrast: 120, saturate: 150 },
      film: { brightness: 95, contrast: 120, saturate: 80, sepia: 20 },
      bw: { brightness: 110, contrast: 120, saturate: 0 },
      warm: { brightness: 105, contrast: 105, saturate: 110, sepia: 15, hueRotate: -10 },
      cool: { brightness: 105, contrast: 105, saturate: 110, hueRotate: 20 },
    };

    const preset = presetFilters[enhancePreset];
    const brightness = preset.brightness ?? enhanceBrightness;
    const contrast = preset.contrast ?? enhanceContrast;
    const saturate = preset.saturate ?? enhanceSaturation;
    const sepia = preset.sepia ?? enhanceSepia;
    const hueRotate = preset.hueRotate ?? enhanceHue;

    const parts = [
      `brightness(${brightness}%)`,
      `contrast(${contrast}%)`,
      `saturate(${saturate}%)`,
    ];

    if (sepia > 0) parts.push(`sepia(${sepia}%)`);
    if (hueRotate !== 0) parts.push(`hue-rotate(${hueRotate}deg)`);

    return parts.join(' ');
  }, [enhancePreset, enhanceBrightness, enhanceContrast, enhanceSaturation, enhanceSepia, enhanceHue]);

  const resetEnhancements = useCallback(() => {
    setEnhancePreset('none');
    setEnhanceBrightness(100);
    setEnhanceContrast(100);
    setEnhanceSaturation(100);
    setEnhanceSepia(0);
    setEnhanceHue(0);
  }, []);

  // Filtered photos
  const filteredPhotos = useMemo(() => {
    return myPlanePics.filter((p) => {
      const matchesSearch =
        p.registration.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.specialLivery.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.airline && p.airline.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.location && p.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchesFormat =
        filterFormat === 'all'
          ? true
          : filterFormat === 'range'
          ? p.isRangeFormat
          : filterFormat === 'autocorrect'
          ? p.isAutoCorrected
          : true;

      const matchesAirline = filterAirline === 'all' ? true : p.airline === filterAirline;

      const matchesCollection =
        selectedCollection === 'all'
          ? true
          : selectedCollection === 'favorites'
          ? p.favorite
          : p.collections?.includes(selectedCollection);

      const matchesTags = activeTags.length === 0 || (p.tags && activeTags.every(tag => p.tags!.includes(tag)));

      return matchesSearch && matchesFormat && matchesAirline && matchesCollection && matchesTags;
    });
  }, [myPlanePics, searchQuery, filterFormat, filterAirline, selectedCollection, activeTags]);

  const sortedPhotos = useMemo(() => {
    return [...filteredPhotos].sort((a, b) => {
      if (sortBy === 'newest') return (b.dateSpotted || '').localeCompare(a.dateSpotted || '') || b.id.localeCompare(a.id);
      if (sortBy === 'oldest') return (a.dateSpotted || '').localeCompare(b.dateSpotted || '') || a.id.localeCompare(b.id);
      if (sortBy === 'registration') return a.registration.localeCompare(b.registration);
      if (sortBy === 'airline') return (a.airline || '').localeCompare(b.airline || '');
      return 0;
    });
  }, [filteredPhotos, sortBy]);

  const liveStats = useMemo(() => computeLiveStats(myPlanePics), [myPlanePics]);

  // Filename Parser Tester State
  const [testFilename, setTestFilename] = useState('HU.26-31A Special Livery (7.30.25).jpg');

  const parsedLiveResult = useMemo(() => parsePlaneFilename(testFilename), [testFilename]);

  const pageCount = useMemo(() => Math.max(1, Math.ceil(sortedPhotos.length / perPage)), [sortedPhotos.length, perPage]);

  const paginatedPhotos = useMemo(() => {
    const start = page * perPage;
    return sortedPhotos.slice(start, start + perPage);
  }, [sortedPhotos, page, perPage]);

  const goToPage = useCallback((next: number) => {
    setPage((prev) => {
      const clamped = Math.max(0, Math.min(pageCount - 1, next));
      return clamped;
    });
  }, [pageCount]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setMyPlanePics((prev) => prev.map(p => p.id === id ? { ...p, favorite: !p.favorite } : p));
  }, [setMyPlanePics]);

  const addCollection = useCallback(() => {
    if (!newCollectionName.trim()) return;
    setCollections((prev) => [...prev, newCollectionName.trim()]);
    setNewCollectionName('');
    setShowCreateCollection(false);
    showToast('Collection Created', `"${newCollectionName.trim()}" collection added`, 'success');
  }, [newCollectionName, showToast]);

  const removeCollection = useCallback((name: string) => {
    setCollections((prev) => prev.filter(c => c !== name));
    setMyPlanePics((prev) => prev.map(p => ({
      ...p,
      collections: p.collections?.filter(c => c !== name)
    })));
    if (selectedCollection === name) setSelectedCollection('all');
  }, [selectedCollection, setMyPlanePics]);

  const togglePhotoInCollection = useCallback((photoId: string, collectionName: string) => {
    setMyPlanePics((prev) => prev.map(p => {
      if (p.id !== photoId) return p;
      const current = p.collections || [];
      const next = current.includes(collectionName)
        ? current.filter(c => c !== collectionName)
        : [...current, collectionName];
      return { ...p, collections: next };
    }));
  }, [setMyPlanePics]);

  const addTagToPhoto = useCallback((photoId: string, tag: string) => {
    if (!tag.trim()) return;
    setMyPlanePics((prev) => prev.map(p => {
      if (p.id !== photoId) return p;
      const current = p.tags || [];
      if (current.includes(tag.trim())) return p;
      return { ...p, tags: [...current, tag.trim()] };
    }));
  }, [setMyPlanePics]);

  const removeTagFromPhoto = useCallback((photoId: string, tag: string) => {
    setMyPlanePics((prev) => prev.map(p => {
      if (p.id !== photoId) return p;
      return { ...p, tags: (p.tags || []).filter(t => t !== tag) };
    }));
  }, [setMyPlanePics]);

  const applyBatchEdit = useCallback(() => {
    if (selectedIds.size === 0) {
      showToast('No Selection', 'Select photos to batch edit', 'warning');
      return;
    }
    setMyPlanePics((prev) => prev.map(p => {
      if (!selectedIds.has(p.id)) return p;
      const updated = { ...p };
      if (batchAirline.trim()) updated.airline = batchAirline.trim();
      if (batchLocation.trim()) updated.location = batchLocation.trim();
      if (batchRating !== null) updated.rating = batchRating;
      return updated;
    }));
    showToast('Batch Edit Applied', `Updated ${selectedIds.size} photo(s)`, 'success');
    setShowBatchEdit(false);
    setBatchAirline('');
    setBatchLocation('');
    setBatchRating(null);
    setSelectedIds(new Set());
  }, [selectedIds, batchAirline, batchLocation, batchRating, showToast, setMyPlanePics]);

  const exportToCSV = useCallback(() => {
    if (myPlanePics.length === 0) {
      showToast('No Photos', 'Add photos to your vault first', 'warning');
      return;
    }
    const headers = ['Filename', 'Registration', 'Airline', 'Model', 'Location', 'Date', 'Livery', 'Tags', 'Notes', 'Rating'];
    const rows = myPlanePics.map(p => [
      p.filename,
      p.registration,
      p.airline || '',
      p.aircraftModel || '',
      p.location || '',
      p.formattedDate || p.dateCaptured || '',
      p.specialLivery || '',
      (p.tags || []).join(';'),
      (p.notes || '').replace(/"/g, '""'),
      p.rating || 0,
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `myplanepics_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Export Complete', 'Album exported as CSV', 'success');
  }, [myPlanePics, showToast]);

  const exportToHTML = useCallback(() => {
    if (myPlanePics.length === 0) {
      showToast('No Photos', 'Add photos to your vault first', 'warning');
      return;
    }
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MyPlanePics Album</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 20px; }
    .header { text-align: center; padding: 40px 0; border-bottom: 1px solid #1e293b; margin-bottom: 30px; }
    .header h1 { font-size: 2.5rem; margin: 0; background: linear-gradient(135deg, #FF5F1F, #ff7236); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .header p { color: #94a3b8; margin-top: 8px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
    .card { background: #1e293b; border-radius: 16px; overflow: hidden; border: 1px solid #334155; }
    .card img { width: 100%; height: 200px; object-fit: cover; }
    .card-body { padding: 16px; }
    .card-title { font-size: 1.1rem; font-weight: 700; color: #fff; margin-bottom: 8px; }
    .card-meta { font-size: 0.85rem; color: #94a3b8; }
    .card-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
    .tag { background: #334155; color: #e2e8f0; padding: 2px 10px; border-radius: 999px; font-size: 0.75rem; }
    .footer { text-align: center; padding: 40px 0; color: #64748b; font-size: 0.85rem; }
  </style>
</head>
<body>
  <div class="header">
    <h1>MyPlanePics Album</h1>
    <p>Exported from Brio — ${new Date().toLocaleDateString()}</p>
  </div>
  <div class="grid">
    ${myPlanePics.map(p => `
    <div class="card">
      <img src="${p.thumbnailUrl || p.imageUrl}" alt="${p.registration}" onerror="this.src='https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&auto=format&fit=crop'" />
      <div class="card-body">
        <div class="card-title">${p.registration}</div>
        <div class="card-meta">
          ${p.airline ? `<div>Airline: ${p.airline}</div>` : ''}
          ${p.aircraftModel ? `<div>Model: ${p.aircraftModel}</div>` : ''}
          ${p.location ? `<div>Location: ${p.location}</div>` : ''}
          ${p.formattedDate ? `<div>Date: ${p.formattedDate}</div>` : ''}
          ${p.specialLivery !== 'None' ? `<div>Livery: ${p.specialLivery}</div>` : ''}
          ${p.notes ? `<div style="margin-top:8px;color:#cbd5e1;">${p.notes.replace(/</g, '&lt;')}</div>` : ''}
        </div>
        ${(p.tags && p.tags.length > 0) ? `<div class="card-tags">${p.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>` : ''}
      </div>
    </div>
    `).join('')}
  </div>
  <div class="footer">
    Generated by Brio MyPlanePics Engine — ${myPlanePics.length} photos
  </div>
</body>
</html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `myplanepics_gallery_${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Gallery Exported', 'HTML gallery downloaded', 'success');
  }, [myPlanePics, showToast]);

  const exportToPDF = useCallback(async () => {
    if (myPlanePics.length === 0) {
      showToast('No Photos', 'Add photos to your vault first', 'warning');
      return;
    }
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;
      const photos = myPlanePics.filter(p => p.mediaType === 'image');
      const videos = myPlanePics.filter(p => p.mediaType === 'video');
      const uniqueRegs = [...new Set(myPlanePics.map(p => p.registration))];

      doc.setFillColor(10, 10, 10);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.text('MyPlanePics Album', pageWidth / 2, 35, { align: 'center' });

      doc.setFontSize(11);
      doc.setTextColor(160);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 44, { align: 'center' });
      doc.text(`${myPlanePics.length} photos in your vault`, pageWidth / 2, 51, { align: 'center' });

      doc.setDrawColor(255, 95, 31);
      doc.setLineWidth(0.8);
      doc.line(margin, 58, pageWidth - margin, 58);

      doc.setFontSize(12);
      doc.setTextColor(40);
      doc.text('Statistics', margin, 68);
      doc.setFontSize(10);
      doc.setTextColor(120);
      doc.text(`Total Media: ${myPlanePics.length}    Photos: ${photos.length}    Videos: ${videos.length}    Unique Registrations: ${uniqueRegs.length}`, margin, 76);

      const perPage = 4;
      const photoWidth = (contentWidth - 10) / 2;
      const photoHeight = 75;
      const startY = 85;

      for (let i = 0; i < myPlanePics.length; i++) {
        const photo = myPlanePics[i];
        const indexOnPage = i % perPage;
        const col = indexOnPage % 2;
        const row = Math.floor(indexOnPage / 2);
        const x = margin + col * (photoWidth + 10);
        const y = startY + row * (photoHeight + 12);

        if (i > 0 && indexOnPage === 0) {
          doc.setFillColor(10, 10, 10);
          doc.rect(0, 0, pageWidth, pageHeight, 'F');
          doc.setTextColor(120);
          doc.setFontSize(8);
          doc.text(`Page ${doc.getNumberOfPages()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
          doc.addPage();
        }

        doc.setDrawColor(60);
        doc.setFillColor(20, 20, 20);
        doc.roundedRect(x, y, photoWidth, photoHeight, 2, 2, 'FD');

        const imgX = x + 3;
        const imgY = y + 3;
        const imgW = photoWidth - 6;
        const imgH = photoHeight - 40;

        if (photo.thumbnailUrl || photo.imageUrl) {
          try {
            doc.addImage(photo.thumbnailUrl || photo.imageUrl, 'JPEG', imgX, imgY, imgW, imgH);
          } catch {
            doc.setFillColor(30, 30, 30);
            doc.rect(imgX, imgY, imgW, imgH, 'F');
            doc.setFontSize(8);
            doc.setTextColor(100);
            doc.text('Image unavailable', imgX + imgW / 2, imgY + imgH / 2, { align: 'center' });
          }
        }

        const textY = imgY + imgH + 4;
        doc.setFontSize(9);
        doc.setTextColor(255);
        doc.setFont('helvetica', 'bold');
        doc.text(photo.registration, x + 4, textY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(160);
        doc.setFontSize(7);
        const meta = `${photo.airline || 'Unknown'} • ${photo.aircraftModel || 'Unknown'}`;
        doc.text(meta, x + 4, textY + 3.5);
        const dateStr = photo.formattedDate || photo.dateCaptured || 'Unknown';
        doc.text(dateStr, x + photoWidth - 4, textY, { align: 'right' });
        if (photo.specialLivery && photo.specialLivery !== 'None') {
          doc.setTextColor(255, 95, 31);
          doc.setFont('helvetica', 'bold');
          doc.text(photo.specialLivery, x + 4, textY + 7);
        }
      }

      doc.setFillColor(10, 10, 10);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      doc.setTextColor(120);
      doc.setFontSize(8);
      doc.text(`Page ${doc.getNumberOfPages()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

      doc.save(`myplanepics_album_${new Date().toISOString().slice(0, 10)}.pdf`);
      showToast('PDF Exported', 'Visual album exported as PDF', 'success');
    } catch (err) {
      showToast('Export Failed', 'Unable to export album as PDF', 'error');
    }
  }, [myPlanePics, showToast]);

  const deleteSelected = useCallback(() => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Delete ${selectedIds.size} selected photo(s) from vault?`)) return;
    setMyPlanePics((prev) => prev.filter((p) => !selectedIds.has(p.id)));
    setSelectedIds(new Set());
    showToast('Photos Deleted', `${selectedIds.size} photo(s) removed from vault.`, 'info');
  }, [selectedIds, showToast, setMyPlanePics]);

  useEffect(() => {
    setPage(0);
  }, [searchQuery, filterFormat, filterAirline, sortBy, myPlanePics.length]);

  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const currentIndex = filteredPhotos.findIndex(p => p.id === lightboxMedia?.id);
        if (currentIndex === -1) return;
        const nextIndex = e.key === 'ArrowRight'
          ? (currentIndex + 1) % filteredPhotos.length
          : (currentIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
        if (filteredPhotos[nextIndex]) setLightboxMedia(filteredPhotos[nextIndex]);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isLightboxOpen, lightboxMedia, filteredPhotos]);

  useEffect(() => {
    if (lightboxMedia) {
      resetEnhancements();
    }
  }, [lightboxMedia]);

  // Folder Input Trigger (shows structure preview first)
  const handleFolderInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const mediaFiles: File[] = [];
    const seenPaths = new Set<string>();
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const isImage = file.type.startsWith('image/') || ['jpg','jpeg','png','gif','bmp','tiff','tif','webp','heic','heif','raw','dng','svg','avif','jxl'].includes(ext);
      const isVideo = file.type.startsWith('video/') || ['mp4','mov','avi','mkv','flv','wmv','webm','m4v','3gp'].includes(ext);
      const fileKey = file.webkitRelativePath || file.name;
      if ((isImage || isVideo) && !seenPaths.has(fileKey)) {
        seenPaths.add(fileKey);
        mediaFiles.push(file);
      }
    }

    if (mediaFiles.length === 0) {
      showToast(t.noMediaFound, t.selectedFolderNoImageVideo, 'warning');
      return;
    }

    setPendingFolderFiles(mediaFiles);
    setShowFolderChoiceModal(true);
  };

  // Show folder structure preview before opening picker
  const handleFolderImportClick = () => {
    setShowFolderStructureModal(true);
  };

  // Continue from structure preview to open folder picker
  const continueToFolderSelect = () => {
    setShowFolderStructureModal(false);
    folderInputRef.current?.click();
  };

  // Execute Folder Upload (Permanent vs Temporary Choice)
  const executeFolderUpload = async (isPermanent: boolean) => {
    setShowFolderChoiceModal(false);
    if (pendingFolderFiles.length === 0) return;

    setIsImporting(true);
    setImportProgress(0);
    setImportStatusText(t.loading || 'Loading...');

    try {
      const existingKeys = new Set(
        myPlanePics
          .filter(p => p.notes?.startsWith('Imported from path:'))
          .map(p => p.notes!.replace('Imported from path: ', '').trim())
      );

      const newFiles = pendingFolderFiles.filter(f => {
        const key = f.webkitRelativePath || f.name;
        return !existingKeys.has(key) && !processedPaths.has(key);
      });

      if (newFiles.length === 0) {
        showToast('Already Imported', 'All files from this folder are already in your vault.', 'info');
        setIsImporting(false);
        setImportProgress(0);
        setImportStatusText('');
        return;
      }

      const newUploadedPhotos = await processFilesInChunks(
        newFiles,
        (progress, status) => {
          setImportProgress(progress);
          setImportStatusText(status);
        },
        isPermanent
      );

      setImportStatusText(t.loading || 'Finalizing import...');
      setImportProgress(100);

      if (newUploadedPhotos.length > 0) {
        setMyPlanePics((prev) => [...newUploadedPhotos, ...prev]);
        setLightboxMedia(newUploadedPhotos[0]);

        if (isPermanent) {
          showToast(
            t.permanentFolderLinked,
            `${t.vaultedLinkedMedia} (${user?.username || 'Guest'})`,
            'success'
          );
        } else {
          showToast(
            t.temporarySessionImport,
            `${t.importedMediaFiles} (${newUploadedPhotos.length})`,
            'info'
          );
        }
      }
    } catch (err: any) {
      showToast(t.folderImportError, err.message || t.encryptionReadError, 'error');
    } finally {
      setPendingFolderFiles([]);
      setIsImporting(false);
      setImportProgress(0);
      setImportStatusText('');
    }
  };

  // Batch / Single File Upload Processing
  const processUploadedFiles = useCallback(async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    setIsImporting(true);
    setImportProgress(0);
    setImportStatusText(t.loading || 'Loading...');

    try {
      const newUploadedPhotos: PlanePhoto[] = [];
      const totalFiles = fileList.length;
      let successCount = 0;

      for (let i = 0; i < totalFiles; i++) {
        const file = fileList[i];
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        const isImage = file.type.startsWith('image/') || ['jpg','jpeg','png','gif','bmp','tiff','tif','webp','heic','heif','raw','dng','svg','avif','jxl'].includes(ext);
        const isVideo = file.type.startsWith('video/') || ['mp4','mov','avi','mkv','flv','wmv','webm','m4v','3gp'].includes(ext);
        if (!isImage && !isVideo) continue;

        setImportStatusText(`${t.loading || 'Processing'} ${file.name} (${i + 1}/${totalFiles})`);
        setImportProgress(Math.round(((i) / totalFiles) * 100));

        const parsed = parsePlaneFilename(file.name);

        const dataUrl = URL.createObjectURL(file);

        const thumbnailUrl = !isVideo ? await generateThumbnail(file) : '';

        const encryptedPayload = await encryptionService.encrypt(
          JSON.stringify({
            notes: `Vaulted media ${file.name}`,
            size: file.size,
            lastModified: file.lastModified,
            timestamp: new Date().toISOString(),
          })
        );

        const newPhoto: PlanePhoto = {
          id: `photo-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
          filename: parsed.filename,
          imageUrl: dataUrl || 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&fit=crop',
          mediaType: isVideo ? 'video' : 'image',
          videoUrl: isVideo ? dataUrl : undefined,
          thumbnailUrl: thumbnailUrl || undefined,
          registration: parsed.registration,
          specialLivery: parsed.specialLivery,
          dateCaptured: parsed.dateCaptured,
          formattedDate: parsed.formattedDate,
          shotNumber: parsed.shotNumber || undefined,
          formatPattern: parsed.formatPattern,
          isRangeFormat: parsed.isRangeFormat,
          isAutoCorrected: parsed.isAutoCorrected,
          location: 'Local Spotting Vault',
          aircraftModel: parsed.isRangeFormat ? 'Military Aircraft Range' : 'Commercial Airliner',
          airline: 'Vault Import',
          spotterName: user?.username || 'Local Spotter',
          isEncrypted: true,
          encryptedData: encryptedPayload,
          rating: 5,
          notes: `Imported file ${file.name}`,
        };

        newUploadedPhotos.push(newPhoto);
        successCount++;

        setImportStatusText(`${t.loading || 'Processing'} ${file.name} (${i + 1}/${totalFiles})`);
        setImportProgress(Math.round(((i + 1) / totalFiles) * 100));
      }

      setImportStatusText(t.loading || 'Finalizing import...');
      setImportProgress(100);

      if (newUploadedPhotos.length > 0) {
        setMyPlanePics((prev) => [...newUploadedPhotos, ...prev]);
        setLightboxMedia(newUploadedPhotos[0]);
        showToast(
          t.vaultSyncComplete,
          `${successCount} ${t.media}${successCount === 1 ? '' : 's'} — ${t.successfullyEncryptedVaulted}`,
          'success'
        );
      } else {
        showToast(t.noValidMedia, t.pleaseSelectImageVideoFiles, 'warning');
      }
    } catch (err: any) {
      showToast(t.vaultImportFailure, `${t.encryptionReadError}: ${err.message}`, 'error');
    } finally {
      setIsImporting(false);
      setImportProgress(0);
      setImportStatusText('');
    }
  }, [user, t, showToast, setMyPlanePics]);

  // Add Custom Photo Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newFilename, setNewFilename] = useState('G-NLPD Retro (8.09.26).jpg');
  const [newModel, setNewModel] = useState('Boeing 787-10');
  const [newAirline, setNewAirline] = useState('British Airways');
  const [newLocation, setNewLocation] = useState('LHR / London Heathrow');
  const [newNotes, setNewNotes] = useState('Spotted on short final into LHR 27R.');

  const PRESET_SAMPLES = [
    { name: '1. Basic', file: 'G-NLPD (7.30.25).jpg' },
    { name: '2. Special Livery', file: 'G-NLPD Honami (7.31.25).png' },
    { name: '3. Multiple Shots', file: 'G-NLPD (7.30.25) 1.jpg' },
    { name: '4. 4-Digit Year', file: 'G-NLPD (7.30.2025).jpg' },
    { name: '5. Missing Parens', file: 'A6-FMR 7.30.25.jpg' },
    { name: '6. Extra Spaces', file: 'A6-FMR (7. 30. 25) 2.jpg' },
    { name: '7. Range + Parens', file: 'HU.26-31A (7.30.25).jpg' },
    { name: '8. Range No Parens', file: 'HU.26-31A 7.30.25.jpg' },
    { name: '9. Range + Livery', file: 'HU.26-31A Special Livery (7.30.25).jpg' },
    { name: '10. Range 4-Digit', file: 'HU.26-31A (7.30.2025).jpg' },
  ];

  const handleAddPhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFilename.trim()) {
      showToast(t.validationWarning, t.filenameStringRequired, 'warning');
      return;
    }

    try {
      const parsed = parsePlaneFilename(newFilename);
      if (!parsed.isValid) {
        showToast(t.validationWarning, t.invalidFormatPattern, 'warning');
        return;
      }

      const encryptedPayload = await encryptionService.encrypt(
        JSON.stringify({ notes: newNotes, model: newModel, airline: newAirline, time: new Date().toISOString() })
      );

      const newPhotoObj: PlanePhoto = {
        id: `photo-${Date.now()}`,
        filename: parsed.filename,
        imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&fit=crop',
        mediaType: 'image',
        registration: parsed.registration,
        specialLivery: parsed.specialLivery,
        dateCaptured: parsed.dateCaptured,
        formattedDate: parsed.formattedDate,
        shotNumber: parsed.shotNumber || undefined,
        formatPattern: parsed.formatPattern,
        isRangeFormat: parsed.isRangeFormat,
        isAutoCorrected: parsed.isAutoCorrected,
        location: newLocation,
        aircraftModel: newModel,
        airline: newAirline,
        spotterName: 'Captain Vance',
        isEncrypted: true,
        encryptedData: encryptedPayload,
        rating: 5,
        notes: newNotes,
      };

      setMyPlanePics([newPhotoObj, ...myPlanePics]);
      setLightboxMedia(newPhotoObj);
      setIsAddModalOpen(false);
      showToast(t.photoVaulted, `${parsed.registration} (${parsed.formatPattern})`, 'success');
    } catch (err: any) {
      showToast(t.vaultError, `${t.failedToEncryptPhotoMetadata}: ${err.message}`, 'error');
    }
  };

  // Process single upload with user-provided metadata
  const processUploadWithMetadata = useCallback(async () => {
    if (!pendingUploadFile) return;

    const file = pendingUploadFile;
    const isVideo = file.type.startsWith('video/');

    setIsImporting(true);
    setImportProgress(0);
    setImportStatusText(t.loading || 'Processing...');

    try {
        const dataUrl = URL.createObjectURL(file);

        const thumbnailUrl = !isVideo ? await generateThumbnail(file) : '';

      const encryptedPayload = await encryptionService.encrypt(
        JSON.stringify({
          notes: `Manual upload: ${file.name}`,
          size: file.size,
          lastModified: file.lastModified,
          timestamp: new Date().toISOString(),
          registration: uploadFormData.registration,
          airline: uploadFormData.airline,
          aircraftModel: uploadFormData.aircraftModel,
          specialLivery: uploadFormData.specialLivery,
          dateCaptured: uploadFormData.dateCaptured,
        })
      );

      const newPhoto: PlanePhoto = {
        id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        filename: file.name,
        imageUrl: dataUrl || 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&fit=crop',
        mediaType: isVideo ? 'video' : 'image',
        videoUrl: isVideo ? dataUrl : undefined,
        thumbnailUrl: thumbnailUrl || undefined,
        registration: uploadFormData.registration || 'Unknown',
        specialLivery: uploadFormData.specialLivery || 'None',
        dateCaptured: uploadFormData.dateCaptured || undefined,
        formattedDate: uploadFormData.dateCaptured || undefined,
        formatPattern: 'Manual',
        isRangeFormat: false,
        isAutoCorrected: false,
        location: 'Local Spotting Vault',
        aircraftModel: uploadFormData.aircraftModel || 'Commercial Airliner',
        airline: uploadFormData.airline || 'Vault Import',
        spotterName: user?.username || 'Local Spotter',
        isEncrypted: true,
        encryptedData: encryptedPayload,
        rating: 5,
        notes: `Manually uploaded: ${file.name}`,
      };

      setMyPlanePics((prev) => [newPhoto, ...prev]);
      setLightboxMedia(newPhoto);
      showToast(t.photoVaulted, `${newPhoto.registration} — AES-256 Encrypted`, 'success');
    } catch (err: any) {
      showToast(t.vaultError, `${t.failedToEncryptPhotoMetadata}: ${err.message}`, 'error');
    } finally {
      setIsImporting(false);
      setImportProgress(0);
      setImportStatusText('');
      setPendingUploadFile(null);
      setShowUploadMetadataModal(false);
      setUploadFormData({
        registration: '',
        airline: '',
        aircraftModel: '',
        specialLivery: '',
        dateCaptured: '',
      });
    }
  }, [pendingUploadFile, uploadFormData, user, t, showToast, setMyPlanePics]);

  const handleClearAll = useCallback(() => {
    if (window.confirm(`Clear all ${myPlanePics.length} photos from vault? This cannot be undone.`)) {
      setMyPlanePics([]);
      setLightboxMedia(null);
      setIsLightboxOpen(false);
      showToast(t.vaultLocked, 'All photos cleared from vault.', 'info');
    }
  }, [myPlanePics.length, showToast, t, setMyPlanePics]);

  return (
    <div className="space-y-6">
      {/* 3D LIQUID GLASS CONTROL HEADER */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-white/15 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
        {/* Ambient Liquid Glow Effects */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-gradient-to-br from-[#FF5F1F]/30 via-orange-500/20 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-gradient-to-tl from-cyan-500/20 via-blue-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Frutiger Aero Light Leaks */}
        <div className="absolute -top-10 right-10 w-40 h-40 bg-gradient-to-br from-white/10 via-cyan-500/10 to-transparent rounded-full blur-2xl pointer-events-none animate-pulse" />
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-gradient-to-tr from-orange-500/10 via-white/5 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-gradient-to-br from-[#FF5F1F] to-orange-600 rounded-2xl text-black shadow-[0_0_20px_rgba(255,95,31,0.5)] border border-white/30 shrink-0">
              <Camera className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-black text-white tracking-wide">MyPlanePics 3D Vault</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1 shadow-sm">
                  <ShieldCheck className="w-3 h-3" /> AES-256 Encrypted
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Liquid glass aircraft album, auto-filename parser (10 MD rules), spotter rankings & stats
              </p>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 overflow-x-auto max-w-full no-scrollbar">
            <button
              onClick={() => setActiveTab('album')}
              className={`liquid-glass-btn flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer ${
                activeTab === 'album'
                  ? 'bg-gradient-to-r from-[#FF5F1F] to-orange-500 text-black shadow-[0_4px_15px_rgba(255,95,31,0.4)] border border-white/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Vault ({myPlanePics.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('parser')}
              className={`liquid-glass-btn flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer ${
                activeTab === 'parser'
                  ? 'bg-gradient-to-r from-[#FF5F1F] to-orange-500 text-black shadow-[0_4px_15px_rgba(255,95,31,0.4)] border border-white/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Parser Engine</span>
            </button>

            <button
              onClick={() => setActiveTab('ranking')}
              className={`liquid-glass-btn flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer ${
                activeTab === 'ranking'
                  ? 'bg-gradient-to-r from-[#FF5F1F] to-orange-500 text-black shadow-[0_4px_15px_rgba(255,95,31,0.4)] border border-white/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Ranking</span>
            </button>

            <button
              onClick={() => setActiveTab('collections')}
              className={`liquid-glass-btn flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer ${
                activeTab === 'collections'
                  ? 'bg-gradient-to-r from-[#FF5F1F] to-orange-500 text-black shadow-[0_4px_15px_rgba(255,95,31,0.4)] border border-white/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Collections</span>
            </button>
          </div>
        </div>
      </div>

        {/* Hidden File Inputs for Upload */}
        <input
          type="file"
          ref={singleInputRef}
          accept="*/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const ext = file.name.split('.').pop()?.toLowerCase() || '';
            const isImage = file.type.startsWith('image/') || ['jpg','jpeg','png','gif','bmp','tiff','tif','webp','heic','heif','raw','dng','svg','avif','jxl'].includes(ext);
            const isVideo = file.type.startsWith('video/') || ['mp4','mov','avi','mkv','flv','wmv','webm','m4v','3gp'].includes(ext);
            if (!isImage && !isVideo) {
              showToast(t.noValidMedia, t.noValidMediaSelectedDesc, 'warning');
              return;
            }
            const parsed = parsePlaneFilename(file.name);
            setUploadFormData({
              registration: parsed.registration || '',
              airline: '',
              aircraftModel: parsed.isRangeFormat ? 'Military Aircraft Range' : 'Commercial Airliner',
              specialLivery: parsed.specialLivery || '',
              dateCaptured: parsed.dateCaptured || '',
            });
            setPendingUploadFile(file);
            setShowUploadMetadataModal(true);
          }}
        />
        <input
          type="file"
          ref={folderInputRef}
          accept="*/*"
          // @ts-ignore
          webkitdirectory=""
          directory=""
          multiple
          className="hidden"
          onChange={handleFolderInputChange}
        />

       {/* Global Import Progress Bar */}
       {isImporting && (
         <div className="p-4 rounded-2xl bg-slate-900/80 border border-[#FF5F1F]/40 space-y-2 relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-r from-[#FF5F1F]/5 via-orange-500/5 to-transparent animate-pulse" />
           <div className="flex items-center justify-between text-xs font-mono relative z-10">
             <span className="text-slate-300 font-bold">Importing Media...</span>
             <span className="text-[#FF5F1F] font-black">{importProgress}%</span>
           </div>
           <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-white/10 relative">
             <div
               className="h-full bg-gradient-to-r from-[#FF5F1F] to-orange-400 rounded-full transition-all duration-300 relative"
               style={{ width: `${importProgress}%` }}
             >
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
             </div>
           </div>
           <p className="text-[11px] text-slate-400 font-mono truncate relative z-10">
             {importStatusText || t.loading}
           </p>
         </div>
       )}

      {/* TAB 1: ALBUM VAULT */}
      {activeTab === 'album' && (
        <div className="space-y-6">
          {/* Spotter Profile Summary Card */}
          <div className="relative overflow-hidden rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-white/15 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
            <div className="absolute -top-24 -right-24 w-60 h-60 bg-gradient-to-bl from-[#FF5F1F]/30 via-orange-500/20 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-gradient-to-tr from-cyan-500/20 via-blue-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#FF5F1F] to-orange-600 flex items-center justify-center text-white font-black text-2xl shadow-[0_0_25px_rgba(255,95,31,0.5)] border-2 border-white/30 shrink-0">
                  {user?.username?.charAt(0).toUpperCase() || '?'}
                </div>
                <div>
                  <h3 className="text-base font-black text-white">{user?.username || 'Guest Spotter'}</h3>
                  <p className="text-[10px] text-slate-400 font-mono">AES-256 Encrypted Vault • {myPlanePics.length} Media Items</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-mono font-bold">
                      {liveStats.uniqueRegistrations} Unique Regs
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-[9px] font-mono font-bold">
                      {liveStats.rangeFormatCount} Military Ranges
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-center px-4 py-2 bg-black/40 rounded-2xl border border-white/10">
                  <p className="text-[9px] text-slate-400 font-mono uppercase">Total Photos</p>
                  <p className="text-xl font-black text-white font-mono">{liveStats.totalPhotos}</p>
                </div>
                <div className="text-center px-4 py-2 bg-black/40 rounded-2xl border border-white/10">
                  <p className="text-[9px] text-slate-400 font-mono uppercase">Auto-Corrected</p>
                  <p className="text-xl font-black text-emerald-400 font-mono">{liveStats.autoCorrectedCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar & Search Bar */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={t.searchRegistrationLiveryAirline}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF5F1F] shadow-inner font-mono"
              />
            </div>

            {/* Filters & Sort */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono">
                <Filter className="w-3.5 h-3.5 text-[#FF5F1F]" />
                <span className="font-bold">{t.format}:</span>
                <select
                  value={filterFormat}
                  onChange={(e) => setFilterFormat(e.target.value)}
                  className="bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#FF5F1F] font-mono cursor-pointer"
                >
                  <option value="all">{t.allPatterns}</option>
                  <option value="range">{t.rangeFormatOnly}</option>
                  <option value="autocorrect">{t.autoCorrectedOnly}</option>
                </select>
              </div>

               <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono">
                 <span className="font-bold">{t.airline}:</span>
                 <select
                   value={filterAirline}
                   onChange={(e) => setFilterAirline(e.target.value)}
                   className="bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#FF5F1F] font-mono cursor-pointer"
                 >
                   <option value="all">{t.allAirlines}</option>
                   <option value="Middle East Airlines">Middle East Airlines</option>
                   <option value="Emirates">Emirates</option>
                   <option value="British Airways">British Airways</option>
                   <option value="Japan Airlines">Japan Airlines</option>
                   <option value="flydubai">flydubai</option>
                   <option value="Spanish Air Force">Spanish Air Force</option>
                 </select>
               </div>

               <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono">
                 <span className="font-bold">Collection:</span>
                 <select
                   value={selectedCollection}
                   onChange={(e) => setSelectedCollection(e.target.value)}
                   className="bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#FF5F1F] font-mono cursor-pointer"
                 >
                   <option value="all">All Photos</option>
                   <option value="favorites">Favorites</option>
                   {collections.map(c => (
                     <option key={c} value={c}>{c}</option>
                   ))}
                 </select>
               </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono">
                <span className="font-bold">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#FF5F1F] font-mono cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="registration">Registration A-Z</option>
                  <option value="airline">Airline A-Z</option>
                </select>
              </div>

              <div className="flex items-center gap-1 bg-slate-950 border border-white/10 rounded-xl p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-[#FF5F1F] text-black' : 'text-slate-400 hover:text-white'}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewMode === 'list' ? 'bg-[#FF5F1F] text-black' : 'text-slate-400 hover:text-white'}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
              </div>

              {selectedIds.size > 0 && (
                <button
                  onClick={deleteSelected}
                  className="liquid-glass-btn px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete ({selectedIds.size})
                </button>
              )}

              {/* Upload Buttons */}
               <div className="flex items-center gap-2">
                  <button
                    onClick={() => singleInputRef.current?.click()}
                    className="liquid-glass-btn px-3.5 py-2 bg-gradient-to-r from-[#FF5F1F] to-orange-500 hover:from-[#ff7236] hover:to-orange-400 text-black font-extrabold text-xs rounded-xl shadow-[0_4px_15px_rgba(255,95,31,0.3)] transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t.uploadPhoto}</span>
                  </button>

                  <button
                    onClick={() => handleFolderImportClick()}
                    className="liquid-glass-btn px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-500/30 font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Layers className="w-4 h-4" />
                    <span>{t.folderImport}</span>
                  </button>

                  <button
                    onClick={() => setGlobalEnhance(!globalEnhance)}
                    className={`liquid-glass-btn px-3 py-2 font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                      globalEnhance
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10'
                    }`}
                    title="Toggle global image enhancement"
                  >
                    <Wand2 className="w-4 h-4" />
                    <span>{globalEnhance ? 'Enhance ON' : 'Enhance'}</span>
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setShowExportMenu(!showExportMenu)}
                      className="liquid-glass-btn px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export</span>
                    </button>
                    {showExportMenu && (
                      <div className="absolute right-0 top-10 z-20 bg-slate-900 border border-slate-700 rounded-xl shadow-xl p-1.5 space-y-1 min-w-[180px]">
                        <button onClick={() => { exportToCSV(); setShowExportMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-lg cursor-pointer">
                          <FileDown className="w-3.5 h-3.5" /> Export as CSV
                        </button>
                        <button onClick={() => { exportToHTML(); setShowExportMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-lg cursor-pointer">
                          <Globe className="w-3.5 h-3.5" /> Export as HTML Gallery
                        </button>
                      </div>
                    )}
                  </div>

                  {selectedIds.size > 0 && (
                    <button
                      onClick={() => setShowBatchEdit(true)}
                      className="liquid-glass-btn px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Batch Edit ({selectedIds.size})
                    </button>
                  )}
                </div>
             </div>
           </div>

          {/* Liquid 3D Photo Grid / List */}
          {sortedPhotos.length === 0 ? (
            <div className="text-center py-16 rounded-3xl border-2 border-dashed border-white/10 bg-slate-900/30">
              <Camera className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-400">{t.noPhotosMatchFilters}</p>
              <p className="text-xs text-slate-500 mt-1">{t.tryAdjustingSearchOrUpload}</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {paginatedPhotos.map((photo) => {
                const isSelected = selectedIds.has(photo.id);
                return (
                  <div
                    key={photo.id}
                    onClick={(e) => {
                      if (e.shiftKey || e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        toggleSelect(photo.id);
                      } else {
                        setLightboxMedia(photo);
                        setIsLightboxOpen(true);
                      }
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      toggleSelect(photo.id);
                    }}
                    className={`liquid-glass-card relative group rounded-3xl overflow-hidden bg-slate-900/60 backdrop-blur-xl border transition-all duration-300 cursor-pointer flex flex-col justify-between hover:-translate-y-1.5 shadow-xl hover:shadow-[0_15px_30px_rgba(0,0,0,0.5)] ${isSelected ? 'border-[#FF5F1F] shadow-[0_0_20px_rgba(255,95,31,0.3)]' : 'border-white/15 hover:border-white/30'}`}
                  >
                    {/* Animated Gradient Border on Hover */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#FF5F1F]/0 via-orange-500/0 to-cyan-500/0 group-hover:from-[#FF5F1F]/30 group-hover:via-orange-500/20 group-hover:to-cyan-500/30 transition-all duration-500 pointer-events-none z-0" />

                    {/* Selection Checkbox */}
                    <div className="absolute top-3 left-3 z-30">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelect(photo.id);
                        }}
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-[#FF5F1F] border-[#FF5F1F]' : 'bg-black/40 border-white/40 hover:border-white/80'}`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </button>
                    </div>

                     {/* Glossy Reflective Overlay */}
                     <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/40 pointer-events-none z-10" />

                     {/* Frutiger Aero Gloss Shine */}
                     <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-white/10 pointer-events-none z-10 opacity-60" />

                      {/* Photo Image Card Header */}
                     <div className="relative h-48 overflow-hidden bg-black">
                       {photo.mediaType === 'video' && photo.videoUrl ? (
                         <video
                           src={photo.videoUrl}
                           className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                           muted
                           style={{ filter: globalEnhance ? getEnhancementFilter() : undefined }}
                         />
                       ) : (
                         <img
                           src={photo.thumbnailUrl || photo.imageUrl}
                           alt={photo.registration}
                           className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                           style={{ filter: globalEnhance ? getEnhancementFilter() : undefined }}
                         />
                       )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-black/40 z-10" />

                      {/* Top Pattern Badges */}
                      <div className="absolute top-3 left-10 right-3 flex items-center justify-between z-20">
                        {photo.isRangeFormat && (
                          <span className="px-2 py-0.5 rounded-full bg-purple-950/90 backdrop-blur-md border border-purple-500/40 text-[9px] font-mono font-bold text-purple-300 shadow-lg">
                            {t.militaryRangeFormats}
                          </span>
                        )}
                        {photo.isAutoCorrected && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-950/90 backdrop-blur-md border border-emerald-500/40 text-[9px] font-mono font-bold text-emerald-300 shadow-lg">
                            {t.autoCorrectedLabel}
                          </span>
                        )}
                      </div>

                      {/* Registration Title Overlay */}
                      <div className="absolute bottom-3 left-3 right-3 z-20">
                        <div className="flex items-baseline justify-between">
                          <h4 className="text-lg font-black text-white tracking-widest font-mono drop-shadow-md">
                            {photo.registration}
                          </h4>
                          <span className="text-[10px] font-mono text-slate-300 font-bold bg-black/60 px-2 py-0.5 rounded border border-white/10">
                            {photo.formattedDate}
                          </span>
                        </div>
                        {photo.specialLivery !== 'None' && (
                          <p className="text-xs font-bold text-[#FF5F1F] truncate mt-0.5 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 shrink-0" /> {photo.specialLivery}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Card Details Footer */}
                    <div className="p-4 space-y-2.5 text-xs z-20">
                      <div className="flex items-center justify-between text-slate-300 font-mono text-[11px]">
                        <span className="font-bold truncate text-slate-200">{photo.airline || 'Commercial Fleet'}</span>
                        <span className="text-slate-400 truncate">{photo.location}</span>
                      </div>

                      <p className="text-slate-200 font-bold truncate text-xs">{photo.aircraftModel}</p>

                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono">
                        <span className="flex items-center gap-1 text-emerald-400 font-bold">
                          <Lock className="w-3 h-3" /> {t.aes256}
                        </span>
                        <span className="text-slate-400">{photo.mediaType === 'video' ? t.video : 'Image'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedPhotos.map((photo) => {
                const isSelected = selectedIds.has(photo.id);
                return (
                  <div
                    key={photo.id}
                    onClick={(e) => {
                      if (e.shiftKey || e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        toggleSelect(photo.id);
                      } else {
                        setLightboxMedia(photo);
                        setIsLightboxOpen(true);
                      }
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      toggleSelect(photo.id);
                    }}
                    className={`liquid-glass-card flex items-center gap-4 p-3 rounded-2xl bg-slate-900/60 backdrop-blur-xl border transition-all cursor-pointer hover:bg-slate-800/60 ${isSelected ? 'border-[#FF5F1F] shadow-[0_0_15px_rgba(255,95,31,0.2)]' : 'border-white/10'}`}
                  >
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-black shrink-0">
                      <img
                        src={photo.thumbnailUrl || photo.imageUrl}
                        alt={photo.registration}
                        className="w-full h-full object-cover"
                        style={{ filter: globalEnhance ? getEnhancementFilter() : undefined }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-white font-mono tracking-wider">{photo.registration}</h4>
                        {photo.isRangeFormat && (
                          <span className="px-1.5 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/40 text-[9px] font-mono font-bold text-purple-300">RNG</span>
                        )}
                        {photo.isAutoCorrected && (
                          <span className="px-1.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[9px] font-mono font-bold text-emerald-300">AUTO</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-mono truncate">{photo.airline || 'Commercial Fleet'} • {photo.aircraftModel}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{photo.formattedDate} • {photo.location}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelect(photo.id);
                        }}
                        className={`p-2 rounded-xl border transition-all cursor-pointer ${isSelected ? 'bg-[#FF5F1F] border-[#FF5F1F] text-black' : 'bg-slate-800 border-white/10 text-slate-400 hover:text-white'}`}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {sortedPhotos.length > 0 && (
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-mono">Per page</span>
                <select
                  value={perPage}
                  onChange={(e) => { setPerPage(Number(e.target.value)); setPage(0); }}
                  className="bg-slate-950 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white font-mono focus:outline-none focus:border-[#FF5F1F]"
                >
                  <option value="8">8</option>
                  <option value="12">12</option>
                  <option value="24">24</option>
                  <option value="48">48</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 0}
                  className="liquid-glass-btn px-3 py-1.5 bg-slate-800 rounded-lg text-white text-xs disabled:opacity-30 flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" /> {t.previous}
                </button>
                <span className="text-[10px] text-slate-400 font-mono">
                  {t.page} {page + 1} {t.of} {pageCount}
                </span>
                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= pageCount - 1}
                  className="liquid-glass-btn px-3 py-1.5 bg-slate-800 rounded-lg text-white text-xs disabled:opacity-30 flex items-center gap-1"
                >
                  {t.next} <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FILENAME PARSER ENGINE */}
      {activeTab === 'parser' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#FF5F1F]/20 border border-[#FF5F1F]/40 rounded-xl text-[#FF5F1F]">
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">
                    MyPlanePics Engine
                  </p>
                  <h3 className="text-base font-black text-white">Interactive Filename Parser Tester</h3>
                </div>
              </div>
              <span className="text-[10px] font-mono px-3 py-1 bg-slate-950 border border-white/10 text-emerald-400 font-bold rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 10 MD Rules Active
              </span>
            </div>

            {/* Test Input & Presets */}
            <div className="space-y-3">
              <label className="text-xs font-mono text-slate-300 font-bold">
                Type or paste test aircraft photo filename:
              </label>
              <input
                type="text"
                value={testFilename}
                onChange={(e) => setTestFilename(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-white/15 rounded-2xl text-sm font-mono text-white focus:outline-none focus:border-[#FF5F1F] shadow-inner"
              />

              <div>
                <p className="text-[10px] font-mono text-slate-400 mb-2 font-bold">
                  Quick Test Presets (10 Supported MD Specifications):
                </p>
                <div className="flex flex-wrap gap-2">
                  {PRESET_SAMPLES.map((sample) => (
                    <button
                      key={sample.name}
                      onClick={() => setTestFilename(sample.file)}
                      className={`liquid-glass-btn px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                        testFilename === sample.file
                          ? 'bg-gradient-to-r from-[#FF5F1F] to-orange-500 text-black font-extrabold shadow-lg'
                          : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-white/10'
                      }`}
                    >
                      {sample.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Tokenizer Breakdown & Extraction Result */}
            <div className="p-6 bg-slate-950/80 rounded-3xl border border-white/15 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase font-black text-[#FF5F1F] tracking-wider">
                  Live Extraction Tokens
                </span>
                {parsedLiveResult.isValid ? (
                  <span className="px-3 py-1 bg-emerald-950 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Format Match Confirmed
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-rose-950 border border-rose-500/30 text-rose-300 text-xs font-mono font-bold rounded-full flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Parse Error
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-900 rounded-2xl border border-white/10 space-y-1">
                  <p className="text-[10px] text-slate-400 font-mono uppercase font-bold">Extracted Registration</p>
                  <p className="text-lg font-black font-mono text-white">{parsedLiveResult.registration}</p>
                </div>

                <div className="p-4 bg-slate-900 rounded-2xl border border-white/10 space-y-1">
                  <p className="text-[10px] text-slate-400 font-mono uppercase font-bold">Extracted Special Livery</p>
                  <p className="text-lg font-bold font-mono text-[#FF5F1F]">{parsedLiveResult.specialLivery}</p>
                </div>

                <div className="p-4 bg-slate-900 rounded-2xl border border-white/10 space-y-1">
                  <p className="text-[10px] text-slate-400 font-mono uppercase font-bold">Formatted Date</p>
                  <p className="text-lg font-bold font-mono text-cyan-400">{parsedLiveResult.formattedDate}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                <div className="p-4 bg-slate-900 rounded-2xl border border-white/10 space-y-2">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Matched Specification Rule</p>
                  <p className="text-sm font-bold text-amber-400">{parsedLiveResult.formatPattern}</p>
                  <p className="text-slate-300 text-[11px]">
                    Shot Number: {parsedLiveResult.shotNumber !== null ? `#${parsedLiveResult.shotNumber}` : 'Single Shot'}
                  </p>
                </div>

                <div className="p-4 bg-slate-900 rounded-2xl border border-white/10 space-y-2">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Auto-Correction Status</p>
                  <p className="text-sm font-bold text-emerald-400">
                    {parsedLiveResult.isAutoCorrected
                      ? 'Auto-Corrected (Parentheses & Spacing sanitized)'
                      : 'Standard Compliant Format'}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-slate-300 text-[11px] truncate flex-1">Normalized: {parsedLiveResult.correctedFilename}</p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(parsedLiveResult.correctedFilename);
                        showToast('Copied', 'Corrected filename copied to clipboard.', 'success');
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 border border-white/10 text-slate-400 hover:text-white hover:border-white/30 transition-all cursor-pointer shrink-0"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RANKING & ANALYTICS */}
      {activeTab === 'ranking' && (
        <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 shadow-2xl space-y-8">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#FF5F1F]/20 border border-[#FF5F1F]/40 rounded-xl text-[#FF5F1F]">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">
                  Vault Analytics
                </p>
                <h3 className="text-base font-black text-white">Spotter Statistics & Trends</h3>
              </div>
            </div>
            <span className="text-[10px] font-mono text-emerald-300 px-3 py-1 bg-slate-950 rounded-full border border-emerald-500/30 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Derived from {myPlanePics.length} Album Photos
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="liquid-glass-card bg-slate-900/60 backdrop-blur-2xl border border-white/15 rounded-3xl p-5 shadow-2xl">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">{t.totalVaultedPhotos}</p>
              <p className="text-3xl font-black text-[#FF5F1F] mt-1 font-mono">{liveStats.totalPhotos}</p>
            </div>

            <div className="liquid-glass-card bg-slate-900/60 backdrop-blur-2xl border border-white/15 rounded-3xl p-5 shadow-2xl">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">{t.uniqueRegistrations}</p>
              <p className="text-3xl font-black text-cyan-400 mt-1 font-mono">{liveStats.uniqueRegistrations}</p>
            </div>

            <div className="liquid-glass-card bg-slate-900/60 backdrop-blur-2xl border border-white/15 rounded-3xl p-5 shadow-2xl">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">{t.militaryRangeFormats}</p>
              <p className="text-3xl font-black text-purple-400 mt-1 font-mono">{liveStats.rangeFormatCount}</p>
            </div>

            <div className="liquid-glass-card bg-slate-900/60 backdrop-blur-2xl border border-white/15 rounded-3xl p-5 shadow-2xl">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">{t.autoCorrectedMatches}</p>
              <p className="text-3xl font-black text-emerald-400 mt-1 font-mono">{liveStats.autoCorrectedCount}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="liquid-glass-card bg-slate-900/60 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4">
              <h4 className="text-xs font-black text-slate-300 uppercase tracking-widest font-mono">
                Top Airlines in Vault
              </h4>
              <div className="space-y-3 font-mono text-xs">
                {liveStats.topAirlines.map((item) => (
                  <div key={item.airline} className="space-y-1">
                    <div className="flex justify-between text-slate-200">
                      <span>{item.airline}</span>
                      <span className="font-extrabold text-[#FF5F1F]">{item.count} photos</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-white/10">
                      <div
                        className="h-full bg-gradient-to-r from-[#FF5F1F] to-orange-400 rounded-full"
                        style={{ width: `${(item.count / (liveStats.totalPhotos || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="liquid-glass-card bg-slate-900/60 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4">
              <h4 className="text-xs font-black text-slate-300 uppercase tracking-widest font-mono">
                Monthly Spotting Trends
              </h4>
              <div className="space-y-3 font-mono text-xs">
                {liveStats.monthlyTrends.map((item) => (
                  <div key={item.month} className="space-y-1">
                    <div className="flex justify-between text-slate-200">
                      <span>{item.month}</span>
                      <span className="font-extrabold text-cyan-400">{item.photos} photos</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-white/10">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                        style={{ width: `${(item.photos / (liveStats.totalPhotos || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {isLightboxOpen && lightboxMedia && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6">
          <div className="liquid-glass-card relative w-full max-w-5xl bg-slate-900/90 border border-white/20 rounded-3xl p-6 shadow-[0_0_80px_rgba(0,0,0,0.9)] space-y-4 overflow-hidden">
            {/* Animated gradient border effect */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#FF5F1F]/20 via-orange-500/10 to-cyan-500/20 opacity-50 pointer-events-none" />

            <div className="flex items-center justify-between pb-3 border-b border-white/10 relative z-10">
              <div className="flex items-center gap-3 font-mono">
                <button
                  onClick={() => {
                    const currentIndex = sortedPhotos.findIndex(p => p.id === lightboxMedia.id);
                    const prevIndex = (currentIndex - 1 + sortedPhotos.length) % sortedPhotos.length;
                    if (sortedPhotos[prevIndex]) {
                      setLightboxMedia(sortedPhotos[prevIndex]);
                    }
                  }}
                  className="liquid-glass-btn p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <span className="text-lg font-black text-[#FF5F1F]">{lightboxMedia.registration}</span>
                  <span className="text-xs text-slate-400 font-bold block">• {lightboxMedia.filename}</span>
                </div>
                <button
                  onClick={() => {
                    const currentIndex = sortedPhotos.findIndex(p => p.id === lightboxMedia.id);
                    const nextIndex = (currentIndex + 1) % sortedPhotos.length;
                    if (sortedPhotos[nextIndex]) {
                      setLightboxMedia(sortedPhotos[nextIndex]);
                    }
                  }}
                  className="liquid-glass-btn p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={() => setIsLightboxOpen(false)}
                className="liquid-glass-btn p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer"
              >
                <X className="liquid-glass-btn w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
              <div className="lg:col-span-2 relative rounded-2xl overflow-hidden bg-black max-h-[60vh] flex items-center justify-center">
                {lightboxMedia.mediaType === 'video' && lightboxMedia.videoUrl ? (
                  <video
                    src={lightboxMedia.videoUrl}
                    controls
                    autoPlay
                    className="w-full h-full object-contain max-h-[60vh]"
                    style={{ filter: getEnhancementFilter() }}
                  />
                ) : (
                  <img
                    src={lightboxMedia.imageUrl}
                    alt={lightboxMedia.registration}
                    className="w-full h-full object-contain max-h-[60vh]"
                    style={{ filter: getEnhancementFilter() }}
                  />
                )}
              </div>

              <div className="space-y-4 text-xs font-mono">
                <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-[#FF5F1F] uppercase tracking-wider">Photo Metadata</h4>
                    <button
                      onClick={() => setShowEnhancePanel(!showEnhancePanel)}
                      className="liquid-glass-btn p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                      title="Image Enhancements"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-2 text-slate-300">
                    <div className="flex justify-between"><span>Registration</span><span className="text-white font-bold">{lightboxMedia.registration}</span></div>
                    <div className="flex justify-between"><span>Airline</span><span className="text-white font-bold">{lightboxMedia.airline || 'N/A'}</span></div>
                    <div className="flex justify-between"><span>Model</span><span className="text-white font-bold">{lightboxMedia.aircraftModel || 'N/A'}</span></div>
                    <div className="flex justify-between"><span>Location</span><span className="text-white font-bold">{lightboxMedia.location || 'N/A'}</span></div>
                    <div className="flex justify-between"><span>Livery</span><span className="text-[#FF5F1F] font-bold">{lightboxMedia.specialLivery}</span></div>
                    <div className="flex justify-between"><span>Date</span><span className="text-white font-bold">{lightboxMedia.formattedDate || lightboxMedia.dateCaptured || 'N/A'}</span></div>
                    <div className="flex justify-between"><span>Format</span><span className="text-cyan-400 font-bold">{lightboxMedia.formatPattern}</span></div>
                    <div className="flex justify-between"><span>Shot</span><span className="text-white font-bold">{lightboxMedia.shotNumber !== undefined ? `#${lightboxMedia.shotNumber}` : 'Single'}</span></div>
                    <div className="flex justify-between"><span>Type</span><span className="text-white font-bold">{lightboxMedia.mediaType === 'video' ? t.video : 'Image'}</span></div>
                  </div>
                </div>

                {/* Enhancement Panel */}
                {showEnhancePanel && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5" /> Enhancements
                      </h4>
                      <button
                        onClick={resetEnhancements}
                        className="liquid-glass-btn px-2 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-[10px] font-bold"
                      >
                        Reset
                      </button>
                    </div>

                    {/* Preset Filters */}
                    <div className="space-y-2">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Presets</p>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: 'none', label: 'None' },
                          { id: 'natural', label: 'Natural' },
                          { id: 'vibrant', label: 'Vibrant' },
                          { id: 'film', label: 'Film' },
                          { id: 'bw', label: 'B&W' },
                          { id: 'warm', label: 'Warm' },
                          { id: 'cool', label: 'Cool' },
                        ].map((preset) => (
                          <button
                            key={preset.id}
                            onClick={() => setEnhancePreset(preset.id as EnhancementPreset)}
                            className={`liquid-glass-btn px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                              enhancePreset === preset.id
                                ? 'bg-gradient-to-r from-[#FF5F1F] to-orange-500 text-black'
                                : 'bg-slate-800 text-slate-300 hover:text-white'
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Manual Adjustments */}
                    <div className="space-y-3">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Adjustments</p>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300 flex items-center gap-1.5">
                            <Sun className="w-3 h-3" /> Brightness
                          </span>
                          <span className="text-slate-400 text-[10px] font-mono">{enhanceBrightness}%</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="150"
                          value={enhanceBrightness}
                          onChange={(e) => { setEnhanceBrightness(Number(e.target.value)); setEnhancePreset('none'); }}
                          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#FF5F1F]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300 flex items-center gap-1.5">
                            <Contrast className="w-3 h-3" /> Contrast
                          </span>
                          <span className="text-slate-400 text-[10px] font-mono">{enhanceContrast}%</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="150"
                          value={enhanceContrast}
                          onChange={(e) => { setEnhanceContrast(Number(e.target.value)); setEnhancePreset('none'); }}
                          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#FF5F1F]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300 flex items-center gap-1.5">
                            <Palette className="w-3 h-3" /> Saturation
                          </span>
                          <span className="text-slate-400 text-[10px] font-mono">{enhanceSaturation}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="200"
                          value={enhanceSaturation}
                          onChange={(e) => { setEnhanceSaturation(Number(e.target.value)); setEnhancePreset('none'); }}
                          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#FF5F1F]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300 flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3" /> Sepia
                          </span>
                          <span className="text-slate-400 text-[10px] font-mono">{enhanceSepia}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={enhanceSepia}
                          onChange={(e) => { setEnhanceSepia(Number(e.target.value)); setEnhancePreset('none'); }}
                          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#FF5F1F]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300 flex items-center gap-1.5">
                            <Palette className="w-3 h-3" /> Hue
                          </span>
                          <span className="text-slate-400 text-[10px] font-mono">{enhanceHue}°</span>
                        </div>
                        <input
                          type="range"
                          min="-180"
                          max="180"
                          value={enhanceHue}
                          onChange={(e) => { setEnhanceHue(Number(e.target.value)); setEnhancePreset('none'); }}
                          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#FF5F1F]"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-slate-300 relative z-10">
              <div className="flex items-center gap-4">
                <span className="text-slate-400">Airline: <span className="liquid-glass-btn text-white font-bold">{lightboxMedia.airline || 'N/A'}</span></span>
                <span className="text-slate-400">Model: <span className="liquid-glass-btn text-white font-bold">{lightboxMedia.aircraftModel || 'N/A'}</span></span>
              </div>
              <span className="text-slate-400">Location: <span className="liquid-glass-btn text-white font-bold">{lightboxMedia.location || 'N/A'}</span></span>
            </div>
          </div>
        </div>
      )}

      {/* FOLDER STRUCTURE PREVIEW MODAL */}
      {showFolderStructureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn">
          <div className="relative w-full max-w-lg bg-slate-900 border-2 border-[#FF5F1F]/50 rounded-3xl p-6 shadow-2xl space-y-5 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-[#FF5F1F]/20 border border-[#FF5F1F]/40 text-[#FF5F1F]">
                  <FolderIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-wide">
                    {t.expectedFolderStructure}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {t.folderStructureHint}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFolderStructureModal(false)}
                className="liquid-glass-btn p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="liquid-glass-btn w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-3 font-mono text-xs text-slate-300">
              <p className="text-sky-300 font-bold flex items-center gap-2">
                <Info className="w-4 h-4" />
                {t.folderStructureHint}
              </p>
              <div className="flex flex-col gap-1.5 text-slate-400">
                <span>📁 FOLDER_NAME/</span>
                <span className="pl-4">📁 AIRLINE/</span>
                <span className="pl-8">📁 AIRCRAFT_TYPE/</span>
                <span className="pl-12">🖼️ filename.jpg</span>
              </div>
              <p className="text-[10px] text-slate-500">
                Example: SELECTED_FOLDER/Emirates/Boeing 777-300ER/A6-EGM.png
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowFolderStructureModal(false)}
                className="liquid-glass-btn p-4 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-2xl text-center transition-all cursor-pointer"
              >
                <span className="font-extrabold text-sm text-slate-300">{t.exit}</span>
              </button>
              <button
                onClick={continueToFolderSelect}
                className="liquid-glass-btn p-4 bg-gradient-to-r from-[#FF5F1F] to-orange-500 hover:from-[#ff7236] hover:to-orange-400 text-black font-extrabold text-sm rounded-2xl shadow-lg transition-all cursor-pointer"
              >
                {t.continueToSelectFolder}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD PHOTO METADATA MODAL */}
      {showUploadMetadataModal && pendingUploadFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn">
          <div className="liquid-glass-card relative w-full max-w-lg bg-slate-900 border-2 border-[#FF5F1F]/50 rounded-3xl p-6 shadow-2xl space-y-5 text-white">
            {/* Animated border glow */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#FF5F1F]/10 via-transparent to-orange-500/10 pointer-events-none" />

            <div className="flex items-center justify-between pb-3 border-b border-white/10 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-[#FF5F1F]/20 border border-[#FF5F1F]/40 text-[#FF5F1F]">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-wide">
                    {t.uploadPhotoDetails}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono truncate max-w-[200px]">
                    {pendingUploadFile.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowUploadMetadataModal(false);
                  setPendingUploadFile(null);
                }}
                className="liquid-glass-btn p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="liquid-glass-btn w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-4 relative z-10">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-xs font-mono text-slate-300 font-bold block mb-1">
                    {t.extractedRegistration}
                  </label>
                  <input
                    type="text"
                    value={uploadFormData.registration}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, registration: e.target.value })}
                    placeholder={t.placeholderRegistration}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF5F1F] font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-300 font-bold block mb-1">
                    {t.airline}
                  </label>
                  <input
                    type="text"
                    value={uploadFormData.airline}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, airline: e.target.value })}
                    placeholder={t.placeholderAirline}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF5F1F] font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-300 font-bold block mb-1">
                    {t.aircraftType}
                  </label>
                  <input
                    type="text"
                    value={uploadFormData.aircraftModel}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, aircraftModel: e.target.value })}
                    placeholder={t.placeholderAircraftType}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF5F1F] font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-300 font-bold block mb-1">
                    {t.specialLiveryOptional}
                  </label>
                  <input
                    type="text"
                    value={uploadFormData.specialLivery}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, specialLivery: e.target.value })}
                    placeholder={t.placeholderSpecialLivery}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF5F1F] font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-300 font-bold block mb-1">
                    {t.dateCaptured}
                  </label>
                  <input
                    type="date"
                    value={uploadFormData.dateCaptured}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, dateCaptured: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF5F1F] font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 relative z-10">
              <button
                onClick={() => {
                  setShowUploadMetadataModal(false);
                  setPendingUploadFile(null);
                }}
                disabled={isImporting}
                className="liquid-glass-btn p-4 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-2xl text-center transition-all cursor-pointer disabled:opacity-50"
              >
                <span className="font-extrabold text-sm text-slate-300">{t.cancel}</span>
              </button>
              <button
                onClick={processUploadWithMetadata}
                disabled={isImporting}
                className="liquid-glass-btn p-4 bg-gradient-to-r from-[#FF5F1F] to-orange-500 hover:from-[#ff7236] hover:to-orange-400 text-black font-extrabold text-sm rounded-2xl shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                <span className="flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  {t.saveToVault}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BATCH EDIT MODAL */}
      {showBatchEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn">
          <div className="liquid-glass-card relative w-full max-w-lg bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 shadow-2xl space-y-5 text-white">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-500/10 via-transparent to-orange-500/10 pointer-events-none" />
            <div className="flex items-center justify-between pb-3 border-b border-white/10 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
                  <Edit3 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-wide">Batch Edit</h3>
                  <p className="text-xs text-slate-400 font-mono">Editing {selectedIds.size} selected photo(s)</p>
                </div>
              </div>
              <button onClick={() => setShowBatchEdit(false)} className="liquid-glass-btn p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white">
                <X className="liquid-glass-btn w-5 h-5" />
              </button>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-4 relative z-10">
              <div>
                <label className="text-xs font-mono text-slate-300 font-bold block mb-1">Airline (leave empty to keep existing)</label>
                <input type="text" value={batchAirline} onChange={(e) => setBatchAirline(e.target.value)} placeholder="e.g. Emirates" className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono" />
              </div>
              <div>
                <label className="text-xs font-mono text-slate-300 font-bold block mb-1">Location (leave empty to keep existing)</label>
                <input type="text" value={batchLocation} onChange={(e) => setBatchLocation(e.target.value)} placeholder="e.g. LHR / London Heathrow" className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono" />
              </div>
              <div>
                <label className="text-xs font-mono text-slate-300 font-bold block mb-1">Rating (leave empty to keep existing)</label>
                <select value={batchRating ?? ''} onChange={(e) => setBatchRating(e.target.value ? Number(e.target.value) : null)} className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono cursor-pointer">
                  <option value="">Keep existing</option>
                  <option value="1">1 - Poor</option>
                  <option value="2">2 - Fair</option>
                  <option value="3">3 - Good</option>
                  <option value="4">4 - Very Good</option>
                  <option value="5">5 - Excellent</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 relative z-10">
              <button onClick={() => setShowBatchEdit(false)} className="liquid-glass-btn p-4 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-2xl text-center transition-all cursor-pointer">
                <span className="font-extrabold text-sm text-slate-300">{t.cancel}</span>
              </button>
              <button onClick={applyBatchEdit} className="liquid-glass-btn p-4 bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-black font-extrabold text-sm rounded-2xl shadow-lg transition-all cursor-pointer">
                <span className="flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" />
                  Apply to {selectedIds.size} Photos
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COLLECTIONS TAB */}
      {activeTab === 'collections' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#FF5F1F]/20 border border-[#FF5F1F]/40 rounded-xl text-[#FF5F1F]">
                  <FolderOpen className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">
                    Collections & Tools
                  </p>
                  <h3 className="text-base font-black text-white">Manage Your Photo Collections</h3>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCreateCollection(true)}
                  className="liquid-glass-btn px-3 py-1.5 bg-[#FF5F1F] hover:bg-[#ff7236] text-black font-extrabold text-xs rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> New Collection
                </button>
              </div>
            </div>

            {showCreateCollection && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-3">
                <label className="text-xs font-mono text-slate-300 font-bold">Collection Name</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    placeholder="e.g. Paris Air Show 2025"
                    className="flex-1 px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF5F1F] font-mono"
                  />
                  <button onClick={addCollection} className="px-4 py-2 bg-[#FF5F1F] text-black font-bold text-xs rounded-xl">Create</button>
                  <button onClick={() => { setShowCreateCollection(false); setNewCollectionName(''); }} className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl">{t.cancel}</button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono">Your Collections</h4>
                <div className="space-y-2">
                  <div
                    onClick={() => setSelectedCollection('all')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${selectedCollection === 'all' ? 'bg-[#FF5F1F]/20 border-[#FF5F1F]/40' : 'bg-slate-950 border-white/10 hover:border-white/20'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">All Photos</span>
                      <span className="text-xs text-slate-400 font-mono">{myPlanePics.length}</span>
                    </div>
                  </div>
                  <div
                    onClick={() => setSelectedCollection('favorites')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${selectedCollection === 'favorites' ? 'bg-[#FF5F1F]/20 border-[#FF5F1F]/40' : 'bg-slate-950 border-white/10 hover:border-white/20'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white flex items-center gap-2"><Star className="w-4 h-4 text-amber-400" /> Favorites</span>
                      <span className="text-xs text-slate-400 font-mono">{myPlanePics.filter(p => p.favorite).length}</span>
                    </div>
                  </div>
                  {collections.map(c => (
                    <div key={c} className="p-3 rounded-xl border bg-slate-950 border-white/10 hover:border-white/20 flex items-center justify-between">
                      <div onClick={() => setSelectedCollection(c)} className="flex-1 cursor-pointer">
                        <span className="text-sm font-bold text-white">{c}</span>
                        <span className="text-xs text-slate-400 font-mono block">{myPlanePics.filter(p => p.collections?.includes(c)).length} photos</span>
                      </div>
                      <button onClick={() => removeCollection(c)} className="p-1.5 text-red-400 hover:text-red-300 cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono">Quick Actions</h4>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={exportToCSV} className="p-4 rounded-xl bg-slate-950 border border-white/10 hover:border-emerald-500/40 transition-all text-left cursor-pointer">
                    <FileDown className="w-6 h-6 text-emerald-400 mb-2" />
                    <p className="text-xs font-bold text-white">Export CSV</p>
                    <p className="text-[10px] text-slate-400">Spreadsheet data</p>
                  </button>
                  <button onClick={exportToHTML} className="p-4 rounded-xl bg-slate-950 border border-white/10 hover:border-cyan-500/40 transition-all text-left cursor-pointer">
                    <Globe className="w-6 h-6 text-cyan-400 mb-2" />
                    <p className="text-xs font-bold text-white">HTML Gallery</p>
                    <p className="text-[10px] text-slate-400">Shareable web page</p>
                  </button>
                  <button onClick={exportToPDF} className="p-4 rounded-xl bg-slate-950 border border-white/10 hover:border-rose-500/40 transition-all text-left cursor-pointer">
                    <FileText className="w-6 h-6 text-rose-400 mb-2" />
                    <p className="text-xs font-bold text-white">Export PDF</p>
                    <p className="text-[10px] text-slate-400">Print-ready album</p>
                  </button>
                  <button onClick={() => showToast('Coming Soon', 'Aircraft watchlist feature coming in next update', 'info')} className="p-4 rounded-xl bg-slate-950 border border-white/10 hover:border-purple-500/40 transition-all text-left cursor-pointer">
                    <Bookmark className="w-6 h-6 text-purple-400 mb-2" />
                    <p className="text-xs font-bold text-white">Watchlist</p>
                    <p className="text-[10px] text-slate-400">Track registrations</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LIGHTBOX NOTE EDITOR */}
      {isLightboxOpen && lightboxMedia && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6">
          <div className="liquid-glass-card relative w-full max-w-5xl bg-slate-900/90 border border-white/20 rounded-3xl p-6 shadow-[0_0_80px_rgba(0,0,0,0.9)] space-y-4 overflow-hidden">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#FF5F1F]/20 via-orange-500/10 to-cyan-500/20 opacity-50 pointer-events-none" />
            <div className="flex items-center justify-between pb-3 border-b border-white/10 relative z-10">
              <div className="flex items-center gap-3 font-mono">
                <button
                  onClick={() => {
                    const currentIndex = sortedPhotos.findIndex(p => p.id === lightboxMedia.id);
                    const prevIndex = (currentIndex - 1 + sortedPhotos.length) % sortedPhotos.length;
                    if (sortedPhotos[prevIndex]) setLightboxMedia(sortedPhotos[prevIndex]);
                  }}
                  className="liquid-glass-btn p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <span className="text-lg font-black text-[#FF5F1F]">{lightboxMedia.registration}</span>
                  <span className="text-xs text-slate-400 font-bold block">• {lightboxMedia.filename}</span>
                </div>
                <button
                  onClick={() => {
                    const currentIndex = sortedPhotos.findIndex(p => p.id === lightboxMedia.id);
                    const nextIndex = (currentIndex + 1) % sortedPhotos.length;
                    if (sortedPhotos[nextIndex]) setLightboxMedia(sortedPhotos[nextIndex]);
                  }}
                  className="liquid-glass-btn p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
              <button onClick={() => { setIsLightboxOpen(false); setEditingNotesForId(null); setEditingTagsForId(null); }} className="liquid-glass-btn p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer">
                <X className="liquid-glass-btn w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
              <div className="lg:col-span-2 relative rounded-2xl overflow-hidden bg-black max-h-[60vh] flex items-center justify-center">
                {lightboxMedia.mediaType === 'video' && lightboxMedia.videoUrl ? (
                  <video src={lightboxMedia.videoUrl} controls autoPlay className="w-full h-full object-contain max-h-[60vh]" style={{ filter: getEnhancementFilter() }} />
                ) : (
                  <img src={lightboxMedia.imageUrl} alt={lightboxMedia.registration} className="w-full h-full object-contain max-h-[60vh]" style={{ filter: getEnhancementFilter() }} />
                )}
              </div>

              <div className="space-y-4 text-xs font-mono">
                <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-[#FF5F1F] uppercase tracking-wider">Photo Metadata</h4>
                    <button onClick={() => setShowEnhancePanel(!showEnhancePanel)} className="liquid-glass-btn p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white" title="Image Enhancements">
                      <Wand2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-2 text-slate-300">
                    <div className="flex justify-between"><span>Registration</span><span className="text-white font-bold">{lightboxMedia.registration}</span></div>
                    <div className="flex justify-between"><span>Airline</span><span className="text-white font-bold">{lightboxMedia.airline || 'N/A'}</span></div>
                    <div className="flex justify-between"><span>Model</span><span className="text-white font-bold">{lightboxMedia.aircraftModel || 'N/A'}</span></div>
                    <div className="flex justify-between"><span>Location</span><span className="text-white font-bold">{lightboxMedia.location || 'N/A'}</span></div>
                    <div className="flex justify-between"><span>Livery</span><span className="text-[#FF5F1F] font-bold">{lightboxMedia.specialLivery}</span></div>
                    <div className="flex justify-between"><span>Date</span><span className="text-white font-bold">{lightboxMedia.formattedDate || lightboxMedia.dateCaptured || 'N/A'}</span></div>
                    <div className="flex justify-between"><span>Format</span><span className="text-cyan-400 font-bold">{lightboxMedia.formatPattern}</span></div>
                    <div className="flex justify-between"><span>Shot</span><span className="text-white font-bold">{lightboxMedia.shotNumber !== undefined ? `#${lightboxMedia.shotNumber}` : 'Single'}</span></div>
                    <div className="flex justify-between"><span>Type</span><span className="text-white font-bold">{lightboxMedia.mediaType === 'video' ? t.video : 'Image'}</span></div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-cyan-400 uppercase tracking-wider">Notes</h4>
                    <button onClick={() => { setEditingNotesForId(editingNotesForId === lightboxMedia.id ? null : lightboxMedia.id); setNotesDraft(lightboxMedia.notes || ''); }} className="liquid-glass-btn p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {editingNotesForId === lightboxMedia.id ? (
                    <textarea
                      value={notesDraft}
                      onChange={(e) => setNotesDraft(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                      rows={3}
                    />
                  ) : (
                    <p className="text-slate-300 text-[11px]">{lightboxMedia.notes || 'No notes added.'}</p>
                  )}
                  {editingNotesForId === lightboxMedia.id && (
                    <button onClick={() => { setMyPlanePics(prev => prev.map(p => p.id === lightboxMedia.id ? { ...p, notes: notesDraft } : p)); setEditingNotesForId(null); showToast('Notes Saved', 'Photo notes updated', 'success'); }} className="px-3 py-1.5 bg-cyan-600 text-white text-xs rounded-lg">Save Notes</button>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-3">
                  <h4 className="text-xs font-black text-purple-400 uppercase tracking-wider">Tags</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(lightboxMedia.tags || []).map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[10px] font-mono flex items-center gap-1">
                        {tag}
                        <button onClick={() => removeTagFromPhoto(lightboxMedia.id, tag)} className="text-purple-400 hover:text-white"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingTagsForId === lightboxMedia.id ? tagInput : ''}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && editingTagsForId === lightboxMedia.id) { addTagToPhoto(lightboxMedia.id, tagInput); setTagInput(''); } }}
                      placeholder="Add tag..."
                      className="flex-1 px-3 py-1.5 bg-slate-900 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                      onFocus={() => setEditingTagsForId(lightboxMedia.id)}
                      onBlur={() => { if (!tagInput.trim()) setEditingTagsForId(null); }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => { toggleFavorite(lightboxMedia.id); }} className={`flex-1 p-2 rounded-xl border transition-all cursor-pointer ${lightboxMedia.favorite ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'border-white/10 text-slate-400 hover:text-white'}`}>
                    <Star className="w-4 h-4 mx-auto" />
                  </button>
                  <button onClick={() => { navigator.clipboard.writeText(lightboxMedia.registration); showToast('Copied', 'Registration copied', 'success'); }} className="flex-1 p-2 rounded-xl border border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer">
                    <Copy className="w-4 h-4 mx-auto" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {showFolderChoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn">
          <div className="liquid-glass-card relative w-full max-w-lg bg-slate-900 border-2 border-[#FF5F1F]/50 rounded-3xl p-6 shadow-2xl space-y-5 text-white">
            {/* Animated border glow */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#FF5F1F]/10 via-transparent to-orange-500/10 pointer-events-none" />

            <div className="flex items-center justify-between pb-3 border-b border-white/10 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-[#FF5F1F]/20 border border-[#FF5F1F]/40 text-[#FF5F1F]">
                  <Layers className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-wide">
                    {t.selectFolderMode}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {pendingFolderFiles.length} {t.aircraftImagesDetected}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFolderChoiceModal(false)}
                className="liquid-glass-btn p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="liquid-glass-btn w-5 h-5" />
              </button>
            </div>

             <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-2 font-mono text-xs text-slate-300 relative z-10">
                <p className="font-bold text-white flex items-center gap-2">
                  <FolderIcon className="w-4 h-4 text-[#FF5F1F]" />
                  {pendingFolderFiles[0]?.webkitRelativePath?.split('/')[0] || 'Selected Folder'}
                </p>
                <p className="text-[11px] text-slate-400">
                  Structure Format: <span className="text-sky-300">SELECTED_FOLDER/AIRLINE/AIRCRAFT_TYPE/FILENAME</span>
                </p>
             </div>

             {/* Import Progress Bar */}
             {isImporting && (
               <div className="p-4 rounded-2xl bg-slate-950 border border-[#FF5F1F]/30 space-y-2 relative z-10">
                 <div className="flex items-center justify-between text-xs font-mono">
                   <span className="text-slate-300 font-bold">Importing Media...</span>
                   <span className="text-[#FF5F1F] font-black">{importProgress}%</span>
                 </div>
                 <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-white/10">
                   <div
                     className="h-full bg-gradient-to-r from-[#FF5F1F] to-orange-400 rounded-full transition-all duration-300 relative"
                     style={{ width: `${importProgress}%` }}
                   >
                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                   </div>
                 </div>
                 <p className="text-[11px] text-slate-400 font-mono truncate">
                   {importStatusText || t.loading}
                 </p>
               </div>
             )}

             <div className="grid grid-cols-1 gap-3 relative z-10">
               <button
                 onClick={() => executeFolderUpload(false)}
                 disabled={isImporting}
                 className="liquid-glass-btn p-4 bg-slate-800 hover:bg-slate-700 border border-white/10 hover:border-sky-400/50 rounded-2xl text-left transition-all cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 <div className="flex items-center justify-between">
                   <span className="font-extrabold text-sm text-sky-300 group-hover:text-white">
                      1. {t.temporaryUpload}
                   </span>
                   <span className="text-[10px] font-mono bg-sky-950 text-sky-400 px-2 py-0.5 rounded border border-sky-800">
                     Current Session Only
                   </span>
                 </div>
                 <p className="text-xs text-slate-400 mt-1">
                   Processes files in memory for current view. Cleared on app restart.
                 </p>
               </button>

               <button
                 onClick={() => executeFolderUpload(true)}
                 disabled={isImporting}
                 className="liquid-glass-btn p-4 bg-gradient-to-r from-[#FF5F1F]/20 via-orange-950/40 to-slate-800 hover:from-[#FF5F1F]/30 border-2 border-[#FF5F1F]/60 rounded-2xl text-left transition-all cursor-pointer group shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 <div className="flex items-center justify-between">
                   <span className="font-extrabold text-sm text-[#FF5F1F] group-hover:text-orange-300 flex items-center gap-2">
                     <ShieldCheck className="w-4 h-4" />
                      2. {t.permanentUpload}
                   </span>
                   <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800">
                     Account Linked
                   </span>
                 </div>
                 <p className="text-xs text-slate-300 mt-1">
                   {t.permanentlyLinksFolderLocation.replace('.', ` (${user?.username || 'Guest'}).`)}
                 </p>
               </button>
             </div>
           </div>
         </div>
       )}
    </div>
  );
};
