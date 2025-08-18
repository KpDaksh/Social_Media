import React, { useEffect, useState } from 'react'
import useAuth from '../features/auth/useAuth'
import { db } from '../services/firebase'
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { Timestamp } from 'firebase/firestore'
import { storage } from '../services/firebase'

const PlaceholderAvatar = ({ name }) => {
  const initial = name ? name.charAt(0).toUpperCase() : '?'
  return (
    <div className="w-28 h-28 rounded-full bg-gray-700 flex items-center justify-center text-2xl font-bold">
      {initial}
    </div>
  )
}

const Profile = () => {
  const { user, logout, loading } = useAuth()
  const [posts, setPosts] = useState([])
  const [followers, setFollowers] = useState(0)
  const [following, setFollowing] = useState(0)
  const [editing, setEditing] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [showAddPost, setShowAddPost] = useState(false)
  const [showAddStory, setShowAddStory] = useState(false)
  const [postFile, setPostFile] = useState(null)
  const [postCaption, setPostCaption] = useState('')
  const [posting, setPosting] = useState(false)
  const [postProgress, setPostProgress] = useState(0)
  const [storyFile, setStoryFile] = useState(null)
  const [storyPosting, setStoryPosting] = useState(false)
  const [storyProgress, setStoryProgress] = useState(0)
  const [stories, setStories] = useState([])
  const [viewingStory, setViewingStory] = useState(null)

  useEffect(() => {
    if (!user) return
    setDisplayName(user.displayName || '')
  }, [user])

  // listen to posts by current user
  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'posts'), where('authorId', '==', user.uid))
    const unsub = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [user])

  // followers / following counts
  useEffect(() => {
    if (!user) return
    const qFollowers = query(collection(db, 'follows'), where('followedId', '==', user.uid))
    const qFollowing = query(collection(db, 'follows'), where('followerId', '==', user.uid))
    const unsubF = onSnapshot(qFollowers, (s) => setFollowers(s.size))
    const unsubG = onSnapshot(qFollowing, (s) => setFollowing(s.size))
    return () => {
      unsubF(); unsubG()
    }
  }, [user])

  // listen to stories (non-expired)
  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'stories'), where('authorId', '==', user.uid))
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      const filtered = data.filter((s) => {
        if (!s.expiresAt) return true
        if (s.expiresAt.seconds) {
          return s.expiresAt.seconds * 1000 > Date.now()
        }
        return true
      })
      setStories(filtered)
    })
    return unsub
  }, [user])

  // fetch user profile extra fields (bio) from users collection
  useEffect(() => {
    if (!user) return
    const userRef = doc(db, 'users', user.uid)
    const unsub = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data()
        setDisplayName(data.displayName || user.displayName || '')
        setBio(data.bio || '')
      }
    })
    return unsub
  }, [user])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      await setDoc(doc(db, 'users', user.uid), { displayName, bio, updatedAt: serverTimestamp() }, { merge: true })
      setEditing(false)
    } catch (err) {
      console.error('Failed to save profile', err)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="min-h-screen p-6 bg-[#0f1116] text-white">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-6">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="avatar" className="w-28 h-28 rounded-full object-cover" />
            ) : (
              <PlaceholderAvatar name={displayName || user?.email} />
            )}

            <div>
              <div className="flex items-center gap-4">
                      <h2 className="text-2xl font-semibold">{displayName || user?.email?.split('@')[0]}</h2>
                      <div className="flex gap-2">
                        <button onClick={() => setEditing(!editing)} className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700">{editing ? 'Cancel' : 'Edit Profile'}</button>
                        <button onClick={() => setShowAddPost(true)} className="px-3 py-1 rounded bg-gradient-to-r from-blue-500 to-indigo-600">Add Post</button>
                        <button onClick={() => setShowAddStory(true)} className="px-3 py-1 rounded bg-purple-600">Add Story</button>
                      </div>
              </div>
              <div className="mt-3 flex gap-6 text-sm text-gray-300">
                <div><span className="font-semibold text-white">{posts.length}</span> posts</div>
                <div><span className="font-semibold text-white">{followers}</span> followers</div>
                <div><span className="font-semibold text-white">{following}</span> following</div>
              </div>
              <div className="mt-3 text-sm text-gray-300">
                <div className="font-medium">{user?.displayName}</div>
                <div className="text-gray-400">{bio || 'No bio yet.'}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={handleLogout} disabled={loading} className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 disabled:opacity-60">{loading ? 'Logging out...' : 'Logout'}</button>
          </div>
        </div>

        {editing && (
          <div className="mb-6 bg-[#0b0d12] p-4 rounded border border-gray-800">
            <div className="mb-3">
              <label className="block text-sm text-gray-400 mb-1">Display name</label>
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full p-2 rounded bg-[#0f1620] border border-gray-800" />
            </div>
            <div className="mb-3">
              <label className="block text-sm text-gray-400 mb-1">Bio</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="w-full p-2 rounded bg-[#0f1620] border border-gray-800" />
            </div>
            <div className="flex gap-3">
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded bg-gradient-to-r from-blue-500 to-indigo-600">{saving ? 'Saving...' : 'Save'}</button>
              <button onClick={() => setEditing(false)} className="px-4 py-2 rounded bg-gray-700">Cancel</button>
            </div>
          </div>
        )}

        {/* Add Post modal */}
        {showAddPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md bg-[#0b0d12] p-6 rounded-lg border border-gray-800">
              <h3 className="text-white text-lg font-semibold mb-3">Create Post</h3>
              <input type="file" accept="image/*" onChange={(e) => setPostFile(e.target.files?.[0] || null)} className="mb-3" />
              <textarea placeholder="Write a caption..." value={postCaption} onChange={(e) => setPostCaption(e.target.value)} className="w-full p-2 rounded bg-[#0f1620] border border-gray-800 mb-3" />
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowAddPost(false)} className="px-4 py-2 rounded bg-gray-700">Cancel</button>
                <button onClick={async () => {
                  if (!user) return
                  if (!postFile) return
                  setPosting(true)
                  try {
                    // use resumable upload to track progress
                    const uploadTask = uploadBytesResumable(storageRef(storage, `posts/${user.uid}/${Date.now()}_${postFile.name}`), postFile)
                    uploadTask.on('state_changed', (snapshot) => {
                      const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
                      setPostProgress(percent)
                    })
                    await uploadTask
                    const url = await getDownloadURL(uploadTask.snapshot.ref)
                    // create post doc with generated id
                    const newPostRef = doc(collection(db, 'posts'))
                    await setDoc(newPostRef, { authorId: user.uid, imageURL: url, caption: postCaption || '', createdAt: serverTimestamp() })
                    setPostProgress(0)
                    setPostFile(null); setPostCaption(''); setShowAddPost(false)
                  } catch (err) {
                    console.error('Post upload failed', err)
                  } finally { setPosting(false) }
                }} disabled={posting || !postFile} className="px-4 py-2 rounded bg-gradient-to-r from-blue-500 to-indigo-600">{posting ? 'Posting...' : 'Post'}</button>
              </div>
              {postProgress > 0 && (
                <div className="mt-3">
                  <div className="text-sm text-gray-300 mb-1">Upload progress: {postProgress}%</div>
                  <div className="w-full bg-gray-800 h-2 rounded">
                    <div style={{ width: `${postProgress}%` }} className="h-2 bg-blue-500 rounded" />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add Story modal */}
        {showAddStory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md bg-[#0b0d12] p-6 rounded-lg border border-gray-800">
              <h3 className="text-white text-lg font-semibold mb-3">Add Story</h3>
              <input type="file" accept="image/*" onChange={(e) => setStoryFile(e.target.files?.[0] || null)} className="mb-3" />
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowAddStory(false)} className="px-4 py-2 rounded bg-gray-700">Cancel</button>
                <button onClick={async () => {
                  if (!user) return
                  if (!storyFile) return
                  setStoryPosting(true)
                  try {
                    const uploadTask = uploadBytesResumable(storageRef(storage, `stories/${user.uid}/${Date.now()}_${storyFile.name}`), storyFile)
                    uploadTask.on('state_changed', (snapshot) => {
                      const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
                      setStoryProgress(percent)
                    })
                    await uploadTask
                    const url = await getDownloadURL(uploadTask.snapshot.ref)
                    // set expiry to 24 hours from now
                    const expiresAt = Timestamp.fromDate(new Date(Date.now() + 24 * 3600 * 1000))
                    const newStoryRef = doc(collection(db, 'stories'))
                    await setDoc(newStoryRef, { authorId: user.uid, imageURL: url, createdAt: serverTimestamp(), expiresAt })
                    setStoryProgress(0)
                    setStoryFile(null); setShowAddStory(false)
                  } catch (err) {
                    console.error('Story upload failed', err)
                  } finally { setStoryPosting(false) }
                }} disabled={storyPosting || !storyFile} className="px-4 py-2 rounded bg-gradient-to-r from-blue-500 to-indigo-600">{storyPosting ? 'Uploading...' : 'Add Story'}</button>
              </div>
              {storyProgress > 0 && (
                <div className="mt-3">
                  <div className="text-sm text-gray-300 mb-1">Upload progress: {storyProgress}%</div>
                  <div className="w-full bg-gray-800 h-2 rounded">
                    <div style={{ width: `${storyProgress}%` }} className="h-2 bg-purple-500 rounded" />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stories carousel */}
        {stories.length > 0 && (
          <div className="flex gap-3 my-4 overflow-x-auto">
            {stories.map((s) => (
              <button key={s.id} onClick={() => setViewingStory(s)} className="w-20 h-32 bg-gray-800 rounded overflow-hidden flex-shrink-0">
                <img src={s.imageURL} className="w-full h-full object-cover" alt="story thumb" />
              </button>
            ))}
          </div>
        )}

        {/* Story viewer modal */}
        {viewingStory && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/90">
            <div className="max-w-3xl w-full p-4">
              <div className="bg-black rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-white">Story</div>
                  <button onClick={() => setViewingStory(null)} className="text-gray-300">Close</button>
                </div>
                <img src={viewingStory.imageURL} alt="story" className="w-full max-h-[70vh] object-contain" />
              </div>
            </div>
          </div>
        )}

        <div>
          <h3 className="text-lg font-semibold mb-3">Posts</h3>
          {posts.length === 0 ? (
            <div className="text-gray-400">No posts yet. Share your first photo!</div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {posts.map((p) => (
                <div key={p.id} className="bg-gray-900 rounded overflow-hidden relative">
                  {p.imageURL ? (
                    <img src={p.imageURL} alt="post image" className="w-full h-40 object-cover" />
                  ) : (
                    <div className="w-full h-40 bg-gray-800 flex items-center justify-center text-gray-500">No image</div>
                  )}
                  <div className="absolute inset-0 flex items-end p-2 opacity-0 hover:opacity-100 transition bg-gradient-to-t from-black/60">
                    <div className="text-sm text-white">{p.caption}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile