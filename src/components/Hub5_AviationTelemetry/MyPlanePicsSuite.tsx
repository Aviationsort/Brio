/**
 * MyPlanePicsSuite Component
 * Liquid Glass & 3D Aircraft Photo Album, Filename Parser,
 * Spotter Ranking Leaderboard, and Analytics & Statistics.
 * Enhanced with 3D depth effects, liquid glassmorphism, and intuitive UX.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { parsePlaneFilename } from '../../utils/planePicsParser';
import {
  computeAirlineRankings,
  computeAircraftModelRankings,
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
  Plane,
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

  // Active Tab: album, parser, ranking, stats
  const [activeTab, setActiveTab] = useState<'album' | 'parser' | 'ranking' | 'stats'>('album');

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

  // Photo Collection State
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxMedia, setLightboxMedia] = useState<PlanePhoto | null>(null);

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

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFormat, setFilterFormat] = useState<string>('all');
  const [filterAirline, setFilterAirline] = useState<string>('all');

  // Folder Input Trigger (shows structure preview first)
  const handleFolderInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const mediaFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const isImage = file.type.startsWith('image/') || ['jpg','jpeg','png','gif','bmp','tiff','tif','webp','heic','heif','raw','dng','svg','avif','jxl'].includes(ext);
      const isVideo = file.type.startsWith('video/') || ['mp4','mov','avi','mkv','flv','wmv','webm','m4v','3gp'].includes(ext);
      if (isImage || isVideo) {
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
      const newUploadedPhotos: PlanePhoto[] = [];
      const totalFiles = pendingFolderFiles.length;
      let successCount = 0;

      for (let i = 0; i < totalFiles; i++) {
        const file = pendingFolderFiles[i];
        const parsedFilename = parsePlaneFilename(file.name);
        const isVideo = file.type.startsWith('video/');

        setImportStatusText(`${t.loading || 'Processing'} ${file.name} (${i + 1}/${totalFiles})`);
        setImportProgress(Math.round(((i) / totalFiles) * 100));

        // Hierarchical Path Extraction: SELECTED_FOLDER/AIRLINE/AIRCRAFT_TYPE/FILENAME
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

        // Read Data URL for session display
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve((e.target?.result as string) || '');
          reader.onerror = () =>
            resolve(isVideo ? '' : 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&fit=crop');
          reader.readAsDataURL(file);
        });

        // Generate thumbnail for persistence
        const thumbnailUrl = !isVideo ? await generateThumbnail(file) : '';

        const encryptedPayload = await encryptionService.encrypt(
          JSON.stringify({
            notes: `Path: ${relPath}`,
            size: file.size,
            lastModified: file.lastModified,
            timestamp: new Date().toISOString(),
          })
        );

        const newPhoto: PlanePhoto = {
          id: `photo-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
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

        if (isPermanent) {
          showToast(
            t.permanentFolderLinked,
            `${t.vaultedLinkedMedia} (${user?.username || 'Guest'})`,
            'success'
          );
        } else {
          showToast(
            t.temporarySessionImport,
            `${t.importedMediaFiles} (${successCount})`,
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
  const processUploadedFiles = async (fileList: FileList | null) => {
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

        // Read Data URL for session display
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve((e.target?.result as string) || '');
          reader.onerror = () =>
            resolve(isVideo ? '' : 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&fit=crop');
          reader.readAsDataURL(file);
        });

        // Generate thumbnail for persistence
        const thumbnailUrl = !isVideo ? await generateThumbnail(file) : '';

        // AES-256 Encryption
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
  };

  // Filename Parser Tester State
  const [testFilename, setTestFilename] = useState('HU.26-31A Special Livery (7.30.25).jpg');

  // Add Custom Photo Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newFilename, setNewFilename] = useState('G-NLPD Retro (8.09.26).jpg');
  const [newModel, setNewModel] = useState('Boeing 787-10');
  const [newAirline, setNewAirline] = useState('British Airways');
  const [newLocation, setNewLocation] = useState('LHR / London Heathrow');
  const [newNotes, setNewNotes] = useState('Spotted on short final into LHR 27R.');

  // Computed Live Standings based on Album Photos
  const liveStats = computeLiveStats(myPlanePics);
  const airlineRankings = computeAirlineRankings(myPlanePics);
  const aircraftModelRankings = computeAircraftModelRankings(myPlanePics);

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

  const parsedLiveResult = parsePlaneFilename(testFilename);

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

      // AES-256 Encryption
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
  const processUploadWithMetadata = async () => {
    if (!pendingUploadFile) return;

    const file = pendingUploadFile;
    const isVideo = file.type.startsWith('video/');

    setIsImporting(true);
    setImportProgress(0);
    setImportStatusText(t.loading || 'Processing...');

    try {
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve((e.target?.result as string) || '');
        reader.onerror = () =>
          resolve(isVideo ? '' : 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&fit=crop');
        reader.readAsDataURL(file);
      });

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
  };

  const handleClearAll = () => {
    if (window.confirm(`Clear all ${myPlanePics.length} photos from vault? This cannot be undone.`)) {
      setMyPlanePics([]);
      setLightboxMedia(null);
      setIsLightboxOpen(false);
      showToast(t.vaultLocked, 'All photos cleared from vault.', 'info');
    }
  };

  // Filtered photos
  const filteredPhotos = myPlanePics.filter((p) => {
    const matchesSearch =
      p.registration.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.specialLivery.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.airline && p.airline.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.location && p.location.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFormat =
      filterFormat === 'all'
        ? true
        : filterFormat === 'range'
        ? p.isRangeFormat
        : filterFormat === 'autocorrect'
        ? p.isAutoCorrected
        : true;

    const matchesAirline = filterAirline === 'all' ? true : p.airline === filterAirline;

    return matchesSearch && matchesFormat && matchesAirline;
  });

  return (
    <div className="space-y-6">
      {/* 3D LIQUID GLASS CONTROL HEADER */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-white/15 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
        {/* Ambient Liquid Glow Effects */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-gradient-to-br from-[#FF5F1F]/30 via-orange-500/20 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-gradient-to-tl from-cyan-500/20 via-blue-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

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
              <span>Spotter Ranks</span>
            </button>

            <button
              onClick={() => setActiveTab('stats')}
              className={`liquid-glass-btn flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer ${
                activeTab === 'stats'
                  ? 'bg-gradient-to-r from-[#FF5F1F] to-orange-500 text-black shadow-[0_4px_15px_rgba(255,95,31,0.4)] border border-white/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <BarChart3 className="liquid-glass-btn w-3.5 h-3.5" />
              <span>Analytics</span>
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
         <div className="p-4 rounded-2xl bg-slate-900/80 border border-[#FF5F1F]/40 space-y-2">
           <div className="flex items-center justify-between text-xs font-mono">
             <span className="text-slate-300 font-bold">Importing Media...</span>
             <span className="text-[#FF5F1F] font-black">{importProgress}%</span>
           </div>
           <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-white/10">
             <div
               className="h-full bg-gradient-to-r from-[#FF5F1F] to-orange-400 rounded-full transition-all duration-300"
               style={{ width: `${importProgress}%` }}
             />
           </div>
           <p className="text-[11px] text-slate-400 font-mono truncate">
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

            {/* Filters */}
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
              </div>
            </div>
          </div>

          {/* Liquid 3D Photo Grid */}
          {filteredPhotos.length === 0 ? (
            <div className="text-center py-16 rounded-3xl border-2 border-dashed border-white/10 bg-slate-900/30">
              <Camera className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-400">{t.noPhotosMatchFilters}</p>
              <p className="text-xs text-slate-500 mt-1">{t.tryAdjustingSearchOrUpload}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredPhotos.map((photo) => {
                return (
                  <div
                    key={photo.id}
                    onClick={() => {
                      setLightboxMedia(photo);
                      setIsLightboxOpen(true);
                    }}
                    className="relative group rounded-3xl overflow-hidden bg-slate-900/60 backdrop-blur-xl border transition-all duration-300 cursor-pointer flex flex-col justify-between hover:-translate-y-1.5 shadow-xl border-white/15 hover:border-white/30 hover:shadow-[0_15px_30px_rgba(0,0,0,0.5)]"
                  >
                    {/* Glossy Reflective Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/40 pointer-events-none z-10" />

                    {/* Photo Image Card Header */}
                    <div className="relative h-48 overflow-hidden bg-black">
                      {photo.mediaType === 'video' && photo.videoUrl ? (
                        <video
                          src={photo.videoUrl}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                          muted
                        />
                      ) : (
                        <img
                          src={photo.thumbnailUrl || photo.imageUrl}
                          alt={photo.registration}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-black/40 z-10" />

                      {/* Top Pattern Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20">
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
                  <p className="text-slate-300 text-[11px] truncate">Normalized: {parsedLiveResult.correctedFilename}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ALBUM RANKINGS (AIRLINES & AIRCRAFT TYPES) */}
      {activeTab === 'ranking' && (
        <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 shadow-2xl space-y-8">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#FF5F1F]/20 border border-[#FF5F1F]/40 rounded-xl text-[#FF5F1F]">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">
                  Album Fleet Rankings
                </p>
                <h3 className="text-base font-black text-white">Airline & Aircraft Model Rankings</h3>
              </div>
            </div>
            <span className="text-[10px] font-mono text-emerald-300 px-3 py-1 bg-slate-950 rounded-full border border-emerald-500/30 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Derived from {myPlanePics.length} Album Photos
            </span>
          </div>

          {/* SECTION 1: TOP AIRLINES RANKING */}
          <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                      <Plane className="w-4 h-4 text-amber-400" /> {t.topSpotterAirlinesRanking}
                    </h4>
                    <span className="text-[11px] font-mono text-slate-400">{t.rankedByPhotoDensity}</span>
                  </div>

            <div className="space-y-3">
              {airlineRankings.map((item) => (
                <div
                  key={item.airline}
                  className="p-4 bg-slate-950/80 border border-white/10 hover:border-amber-400/50 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 transition-all shadow-md"
                >
                  <div className="flex items-center gap-3.5 w-full md:w-auto">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 font-black font-mono text-sm flex items-center justify-center shrink-0">
                      #{item.rank}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="font-extrabold text-sm text-white">{item.airline}</h5>
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-400/30 text-[10px] font-mono text-amber-300 font-bold">
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                        Registrations: {item.exampleRegs.length > 0 ? item.exampleRegs.join(', ') : 'Vaulted Photos'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-right font-mono">
                      <p className="text-xs text-slate-400 font-bold">Photos</p>
                      <p className="text-lg font-black text-white">{item.photoCount}</p>
                    </div>
                    <div className="text-right font-mono">
                      <p className="text-xs text-slate-400 font-bold">Album Share</p>
                      <p className="text-lg font-black text-cyan-400">{item.percentage}%</p>
                    </div>
                    <div className="text-right font-mono">
                      <p className="text-xs text-slate-400 font-bold">Rarity</p>
                      <p className="text-lg font-black text-emerald-400">{item.rarityScore}/100</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 2: TOP AIRCRAFT MODEL RANKING */}
          <div className="space-y-4 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono font-bold text-sky-300 uppercase tracking-wider flex items-center gap-2">
                      <Layers className="w-4 h-4 text-sky-400" /> {t.topAircraftTypesModelsRanking}
                    </h4>
                    <span className="text-[11px] font-mono text-slate-400">{t.rankedByModelFrequency}</span>
                  </div>

            <div className="space-y-3">
              {aircraftModelRankings.map((item) => (
                <div
                  key={item.aircraftModel}
                  className="p-4 bg-slate-950/80 border border-white/10 hover:border-sky-400/50 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 transition-all shadow-md"
                >
                  <div className="flex items-center gap-3.5 w-full md:w-auto">
                    <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/40 text-sky-300 font-black font-mono text-sm flex items-center justify-center shrink-0">
                      #{item.rank}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="font-extrabold text-sm text-white">{item.aircraftModel}</h5>
                        <span className="px-2 py-0.5 rounded-md bg-sky-500/10 border border-sky-400/30 text-[10px] font-mono text-sky-300 font-bold">
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                        Sample Regs: {item.exampleRegs.length > 0 ? item.exampleRegs.join(', ') : 'Spotted'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-right font-mono">
                      <p className="text-xs text-slate-400 font-bold">Photos</p>
                      <p className="text-lg font-black text-white">{item.photoCount}</p>
                    </div>
                    <div className="text-right font-mono">
                      <p className="text-xs text-slate-400 font-bold">Album Share</p>
                      <p className="text-lg font-black text-cyan-400">{item.percentage}%</p>
                    </div>
                    <div className="text-right font-mono">
                      <p className="text-xs text-slate-400 font-bold">Rarity</p>
                      <p className="text-lg font-black text-purple-400">{item.rarityScore}/100</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: STATISTICS & ANALYTICS */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/15 rounded-3xl p-5 shadow-2xl">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">{t.totalVaultedPhotos}</p>
              <p className="text-3xl font-black text-[#FF5F1F] mt-1 font-mono">{liveStats.totalPhotos}</p>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/15 rounded-3xl p-5 shadow-2xl">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">{t.uniqueRegistrations}</p>
              <p className="text-3xl font-black text-cyan-400 mt-1 font-mono">{liveStats.uniqueRegistrations}</p>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/15 rounded-3xl p-5 shadow-2xl">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">{t.militaryRangeFormats}</p>
              <p className="text-3xl font-black text-purple-400 mt-1 font-mono">{liveStats.rangeFormatCount}</p>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/15 rounded-3xl p-5 shadow-2xl">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">{t.autoCorrectedMatches}</p>
              <p className="text-3xl font-black text-emerald-400 mt-1 font-mono">{liveStats.autoCorrectedCount}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4">
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
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4">
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
                      />
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
          <div className="relative w-full max-w-5xl bg-slate-900/90 border border-white/20 rounded-3xl p-6 shadow-[0_0_80px_rgba(0,0,0,0.9)] space-y-4 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3 font-mono">
                <button
                  onClick={() => {
                    const currentIndex = filteredPhotos.findIndex(p => p.id === lightboxMedia.id);
                    const prevIndex = (currentIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
                    if (filteredPhotos[prevIndex]) {
                      setLightboxMedia(filteredPhotos[prevIndex]);
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
                    const currentIndex = filteredPhotos.findIndex(p => p.id === lightboxMedia.id);
                    const nextIndex = (currentIndex + 1) % filteredPhotos.length;
                    if (filteredPhotos[nextIndex]) {
                      setLightboxMedia(filteredPhotos[nextIndex]);
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

            <div className="relative rounded-2xl overflow-hidden bg-black max-h-[60vh] flex items-center justify-center">
              {lightboxMedia.mediaType === 'video' && lightboxMedia.videoUrl ? (
                <video
                  src={lightboxMedia.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain max-h-[60vh]"
                />
              ) : (
                <img
                  src={lightboxMedia.imageUrl}
                  alt={lightboxMedia.registration}
                  className="w-full h-full object-contain max-h-[60vh]"
                />
              )}
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-slate-300">
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
          <div className="relative w-full max-w-lg bg-slate-900 border-2 border-[#FF5F1F]/50 rounded-3xl p-6 shadow-2xl space-y-5 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
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

            <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-4">
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

            <div className="grid grid-cols-2 gap-3">
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

      {/* FOLDER OPTION CONFIRMATION MODAL (PERMANENT VS TEMPORARY) */}
      {showFolderChoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn">
          <div className="relative w-full max-w-lg bg-slate-900 border-2 border-[#FF5F1F]/50 rounded-3xl p-6 shadow-2xl space-y-5 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
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

             <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-2 font-mono text-xs text-slate-300">
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
               <div className="p-4 rounded-2xl bg-slate-950 border border-[#FF5F1F]/30 space-y-2">
                 <div className="flex items-center justify-between text-xs font-mono">
                   <span className="text-slate-300 font-bold">Importing Media...</span>
                   <span className="text-[#FF5F1F] font-black">{importProgress}%</span>
                 </div>
                 <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-white/10">
                   <div
                     className="h-full bg-gradient-to-r from-[#FF5F1F] to-orange-400 rounded-full transition-all duration-300"
                     style={{ width: `${importProgress}%` }}
                   />
                 </div>
                 <p className="text-[11px] text-slate-400 font-mono truncate">
                   {importStatusText || t.loading}
                 </p>
               </div>
             )}

             <div className="grid grid-cols-1 gap-3">
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
