import { useState, useRef } from 'react';
import { X, Upload, ImagePlus, CheckCircle } from 'lucide-react';
import API from '../../api/axios';
import toast from 'react-hot-toast';

const ResolveModal = ({ issue, onClose, onResolved }) => {
  const [image,       setImage]       = useState(null);
  const [preview,     setPreview]     = useState(null);
  const [note,        setNote]        = useState('');
  const [loading,     setLoading]     = useState(false);
  const [dragging,    setDragging]    = useState(false);
  const fileRef = useRef();

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async () => {
    if (!image) { toast.error('Please upload a resolution proof image'); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('resolvedImage', image);
      formData.append('note', note);

      const { data } = await API.post(
        `/issues/${issue._id}/resolve`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      toast.success('Issue marked as resolved with proof! ✅');
      onResolved(data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resolve issue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg border border-gray-100 dark:border-gray-700 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-500 flex items-center justify-center">
              <CheckCircle size={18} className="text-white"/>
            </div>
            <div>
              <h2 className="font-bold text-gray-800 dark:text-white text-sm">Mark as Resolved</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Upload proof of resolution</p>
            </div>
          </div>
          <button onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors">
            <X size={18}/>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Issue title */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Resolving issue</p>
            <p className="font-semibold text-gray-800 dark:text-white text-sm">{issue.title}</p>
          </div>

          {/* Image upload area */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
              Resolution Proof Image <span className="text-red-500">*</span>
            </label>

            {!preview ? (
              <div
                onClick={() => fileRef.current.click()}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200
                  ${dragging
                    ? 'border-green-400 bg-green-50 dark:bg-green-900/20 scale-[1.01]'
                    : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
              >
                <div className="w-14 h-14 rounded-2xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3">
                  <ImagePlus size={24} className="text-green-500"/>
                </div>
                <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm mb-1">
                  {dragging ? 'Drop image here' : 'Click or drag to upload'}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  PNG, JPG, WEBP up to 10MB
                </p>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => handleFile(e.target.files[0])}
                />
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                <img src={preview} alt="preview"
                  className="w-full h-52 object-cover"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"/>
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <span className="text-xs text-white bg-black/40 px-2 py-1 rounded-lg backdrop-blur-sm">
                    ✅ After image selected
                  </span>
                  <button
                    onClick={() => { setImage(null); setPreview(null); }}
                    className="text-xs text-white bg-red-500/80 hover:bg-red-500 px-2 py-1 rounded-lg transition-colors"
                  >
                    Change
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Optional note */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
              Resolution Note <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Describe what was done to resolve this issue..."
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400 resize-none placeholder-gray-400 dark:placeholder-gray-500 transition-all"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-1">
            <button onClick={onClose}
              className="flex-1 py-3 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!image || loading}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: image && !loading ? 'linear-gradient(135deg, #22c55e, #16a34a)' : '#9ca3af',
                boxShadow: image && !loading ? '0 0 20px rgba(34,197,94,0.3)' : 'none',
              }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
                    <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={15}/> Submit Resolution
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResolveModal;