import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { useStore } from '../../src/store';
import { toast } from 'sonner-native';
import { FileText, Trash2, Edit3, Search, Save, X, FolderOpen, Tag, RotateCcw, Ban } from 'lucide-react-native';
import { PageHeader, SectionTitle, EmptyState, FloatingHelpButton } from '../../src/components/ui';

export default function ProjectsTab() {
  const {
    projects,
    trashProject,
    restoreProject,
    permanentlyDeleteProject,
    emptyTrash,
    updateProject
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showTrash, setShowTrash] = useState(false);

  // Get all unique tags (excluding deleted)
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    projects.forEach(p => {
      if (!p.deletedAt && p.tags) p.tags.forEach(t => tags.add(t));
    });
    return Array.from(tags).sort();
  }, [projects]);

  // Memoized filtered projects (search + tag filter + trash mode)
  const filteredProjects = useMemo(() =>
    projects.filter(p => {
      // 1. Trash filter
      const isDeleted = !!p.deletedAt;
      if (showTrash !== isDeleted) return false;

      // 2. Search filter
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.data?.content?.toLowerCase().includes(searchQuery.toLowerCase());

      // 3. Tag filter (only in active mode)
      const matchesTag = selectedTag ? p.tags?.includes(selectedTag) : true;

      return matchesSearch && matchesTag;
    }),
    [projects, searchQuery, selectedTag, showTrash]
  );

  const handleTrash = useCallback((id: string, name: string) => {
    trashProject(id);
    toast.success('Moves to trash', {
      action: {
        label: 'Undo',
        onClick: () => {
          restoreProject(id);
          toast.success('Restored!');
        },
      },
    });
  }, [trashProject, restoreProject]);

  const handleRestore = useCallback((id: string) => {
    restoreProject(id);
    toast.success('Project restored!');
  }, [restoreProject]);

  const handlePermanentDelete = useCallback((id: string) => {
    if (Platform.OS === 'web') {
      if (confirm('Delete forever? This cannot be undone.')) {
        permanentlyDeleteProject(id);
        toast.success('Permanently deleted');
      }
    } else {
      Alert.alert(
        'Delete Forever',
        'This cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              permanentlyDeleteProject(id);
              toast.success('Permanently deleted');
            }
          }
        ]
      );
    }
  }, [permanentlyDeleteProject]);

  const handleEmptyTrash = useCallback(() => {
    if (filteredProjects.length === 0) return;

    if (Platform.OS === 'web') {
      if (confirm('Empty trash? This will permanently delete all items.')) {
        emptyTrash();
        toast.success('Trash emptied');
      }
    } else {
      Alert.alert(
        'Empty Trash',
        'Permanently delete all items?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Empty',
            style: 'destructive',
            onPress: () => {
              emptyTrash();
              toast.success('Trash emptied');
            }
          }
        ]
      );
    }
  }, [emptyTrash, filteredProjects.length]);

  const handleEdit = useCallback((id: string, content: string) => {
    setEditingId(id);
    setEditContent(content);
  }, []);

  const handleSaveEdit = useCallback((id: string) => {
    updateProject(id, { content: editContent });
    setEditingId(null);
    setEditContent('');
    toast.success('Changes saved!');
  }, [editContent, updateProject]);

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditContent('');
  }, []);

  return (
    <View className="flex-1 bg-zinc-950">
      {/* Header */}
      <PageHeader
        title={showTrash ? "Trash" : "Projects"}
        subtitle={showTrash ? "Deleted items" : `${filteredProjects.length} captured data streams`}
        rightAction={
          <TouchableOpacity
            onPress={() => setShowTrash(!showTrash)}
            className={`p-2 rounded-full ${showTrash ? 'bg-red-900/30' : 'bg-zinc-800'}`}
          >
            {showTrash ? (
              <FolderOpen size={20} color="#ef4444" />
            ) : (
              <Trash2 size={20} color="#71717a" />
            )}
          </TouchableOpacity>
        }
      />

      {/* Filter Bar (Only show in Active mode) */}
      {!showTrash && (
        <View className="border-b border-zinc-800 bg-zinc-900/50">
          {/* Search Input */}
          <View className="px-4 py-3">
            <View className="flex-row items-center bg-zinc-900 border border-zinc-800 rounded-xl px-4">
              <Search size={18} color="#52525b" />
              <TextInput
                className="flex-1 text-zinc-100 p-3"
                placeholder="Search projects..."
                placeholderTextColor="#52525b"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <X size={18} color="#71717a" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Tag Filters */}
          {allTags.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="px-4 pb-3"
            >
              <TouchableOpacity
                onPress={() => setSelectedTag(null)}
                className={`mr-2 px-3 py-1.5 rounded-full border ${selectedTag === null
                    ? 'bg-cyan-600 border-cyan-500'
                    : 'bg-zinc-800 border-zinc-700'
                  }`}
              >
                <Text className={`text-xs font-bold ${selectedTag === null ? 'text-white' : 'text-zinc-400'
                  }`}>
                  All
                </Text>
              </TouchableOpacity>

              {allTags.map(tag => (
                <TouchableOpacity
                  key={tag}
                  onPress={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`flex-row items-center mr-2 px-3 py-1.5 rounded-full border ${selectedTag === tag
                      ? 'bg-cyan-900/50 border-cyan-500'
                      : 'bg-zinc-900 border-zinc-700'
                    }`}
                >
                  <Tag size={10} color={selectedTag === tag ? '#22d3ee' : '#71717a'} />
                  <Text className={`text-xs font-bold ml-1.5 ${selectedTag === tag ? 'text-cyan-400' : 'text-zinc-400'
                    }`}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}

      {/* Trash Header Action */}
      {showTrash && filteredProjects.length > 0 && (
        <View className="px-4 py-3 border-b border-zinc-800 flex-row justify-end">
          <TouchableOpacity
            onPress={handleEmptyTrash}
            className="flex-row items-center bg-red-900/20 px-3 py-1.5 rounded-lg border border-red-900/50"
          >
            <Trash2 size={14} color="#ef4444" />
            <Text className="text-red-400 text-xs font-bold ml-2">Empty Trash</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView className="flex-1 p-4">
        {filteredProjects.length === 0 ? (
          <EmptyState
            icon={showTrash ? Trash2 : FolderOpen}
            title={
              showTrash
                ? 'Trash is empty'
                : (searchQuery || selectedTag ? 'No matches found' : 'No projects yet')
            }
            description={
              showTrash
                ? 'Deleted items will appear here'
                : (searchQuery || selectedTag
                  ? 'Try different filters or search terms'
                  : 'Go to the Command tab to capture your first idea or note.')
            }
          />
        ) : (
          <>
            <SectionTitle
              title={showTrash ? "Deleted Items" : "All Projects"}
              icon={showTrash ? Trash2 : FileText}
              count={filteredProjects.length}
            />

            {filteredProjects.map((project) => (
              <View
                key={project.id}
                className="bg-zinc-900 rounded-2xl border border-zinc-800 mb-4 overflow-hidden"
              >
                {/* Project header */}
                <View className="p-4 pb-2 flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View className={`p-2.5 rounded-xl ${showTrash ? 'bg-red-900/20' : 'bg-zinc-800'}`}>
                      <FileText size={18} color={showTrash ? '#ef4444' : '#71717a'} />
                    </View>
                    <View className="ml-4 flex-1">
                      <Text className={`font-bold text-base ${showTrash ? 'text-zinc-400 italic' : 'text-zinc-100'}`}>
                        {project.name}
                      </Text>
                      <Text className="text-zinc-500 text-xs mt-1">
                        {new Date(project.createdAt).toLocaleString()}
                      </Text>
                    </View>
                  </View>

                  {/* Action buttons */}
                  <View className="flex-row gap-2">
                    {showTrash ? (
                      <>
                        <TouchableOpacity
                          onPress={() => handleRestore(project.id)}
                          className="p-2.5 bg-emerald-900/20 border border-emerald-900/50 rounded-lg active:bg-emerald-900/40"
                        >
                          <RotateCcw size={16} color="#34d399" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handlePermanentDelete(project.id)}
                          className="p-2.5 bg-red-900/20 border border-red-900/50 rounded-lg active:bg-red-900/40"
                        >
                          <Ban size={16} color="#ef4444" />
                        </TouchableOpacity>
                      </>
                    ) : (
                      <>
                        <TouchableOpacity
                          onPress={() => handleEdit(project.id, project.data?.content || '')}
                          className="p-2.5 bg-zinc-800 rounded-lg active:bg-zinc-700"
                        >
                          <Edit3 size={16} color="#a1a1aa" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleTrash(project.id, project.name)}
                          className="p-2.5 bg-zinc-800 rounded-lg active:bg-red-900/30"
                        >
                          <Trash2 size={16} color="#ef4444" />
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>

                {/* Content preview or edit */}
                {editingId === project.id ? (
                  <View className="p-4">
                    <TextInput
                      className="bg-zinc-950 border border-zinc-700 text-zinc-100 p-4 rounded-xl min-h-32"
                      value={editContent}
                      onChangeText={setEditContent}
                      multiline
                      autoFocus
                    />
                    <View className="flex-row gap-3 mt-4">
                      <TouchableOpacity
                        onPress={() => handleSaveEdit(project.id)}
                        className="flex-1 bg-cyan-600 py-3.5 rounded-xl flex-row items-center justify-center active:bg-cyan-700"
                      >
                        <Save size={16} color="#fff" />
                        <Text className="text-white font-bold ml-2">Save</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={handleCancelEdit}
                        className="flex-1 bg-zinc-800 py-3.5 rounded-xl flex-row items-center justify-center active:bg-zinc-700"
                      >
                        <X size={16} color="#a1a1aa" />
                        <Text className="text-zinc-400 font-bold ml-2">Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View className="px-4 pb-4">
                    {project.data?.content && (
                      <Text className="text-zinc-400 text-sm leading-5 mb-3" numberOfLines={3}>
                        {project.data.content}
                      </Text>
                    )}

                    {/* Tags */}
                    {project.tags && project.tags.length > 0 && (
                      <View className="flex-row flex-wrap border-t border-zinc-800 pt-3">
                        {project.tags.map(tag => (
                          <View key={tag} className="flex-row items-center bg-zinc-800/80 px-2 py-1 rounded mr-2 mb-1">
                            <Tag size={10} color="#71717a" />
                            <Text className="text-zinc-400 text-[10px] ml-1">#{tag}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* Floating Help */}
      <FloatingHelpButton />
    </View>
  );
}
