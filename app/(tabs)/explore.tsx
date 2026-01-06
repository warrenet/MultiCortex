import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { useStore } from '../../src/store';
import { TipService } from '../../src/services/TipService';
import { toast } from 'sonner-native';
import { FileText, Trash2, Edit3, ChevronRight, Search, HelpCircle } from 'lucide-react-native';

export default function ProjectsTab() {
  const { projects, deleteProject, updateProject } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  // Show tip on first load
  useEffect(() => {
    if (projects.length === 0) {
      const tip = TipService.getRandomTip('projects');
      toast.info(tip.message, { duration: 5000 });
    }
  }, []);

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.data?.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string, name: string) => {
    if (Platform.OS === 'web') {
      if (confirm(`Delete "${name}"? This cannot be undone.`)) {
        deleteProject(id);
        toast.success('Project deleted');
      }
    } else {
      Alert.alert(
        'Delete Project',
        `Delete "${name}"? This cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              deleteProject(id);
              toast.success('Project deleted');
            }
          }
        ]
      );
    }
  };

  const handleEdit = (id: string, content: string) => {
    setEditingId(id);
    setEditContent(content);
    toast.info('Edit mode activated. Tap Save when done.');
  };

  const handleSaveEdit = (id: string) => {
    updateProject(id, { content: editContent });
    setEditingId(null);
    setEditContent('');
    toast.success('Changes saved!');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
    toast.info('Edit cancelled');
  };

  const handleShowTip = () => {
    const tip = TipService.getRandomTip('projects');
    toast.info(`${tip.title}\n${tip.message}`, { duration: 6000 });
  };

  return (
    <View className="flex-1 bg-zinc-950">
      {/* Header */}
      <View className="bg-zinc-900 border-b border-zinc-800 p-4 pt-12">
        <View className="flex-row justify-between items-center mb-3">
          <View>
            <Text className="text-zinc-100 font-bold text-lg tracking-wider">PROJECTS</Text>
            <Text className="text-zinc-500 text-xs">{projects.length} captured data streams</Text>
          </View>
          <TouchableOpacity onPress={handleShowTip} className="p-2">
            <HelpCircle size={20} color="#71717a" />
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View className="flex-row items-center bg-zinc-950 border border-zinc-800 rounded-lg px-3">
          <Search size={16} color="#52525b" />
          <TextInput
            className="flex-1 text-zinc-100 p-3"
            placeholder="Search projects..."
            placeholderTextColor="#52525b"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        {filteredProjects.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <FileText size={48} color="#3f3f46" />
            <Text className="text-zinc-600 mt-4 text-center">
              {searchQuery
                ? 'No projects match your search.'
                : 'No projects yet.\nGo to Command tab to capture data.'
              }
            </Text>
          </View>
        ) : (
          filteredProjects.map((project) => (
            <View
              key={project.id}
              className="bg-zinc-900 rounded-lg border border-zinc-800 mb-3 overflow-hidden"
            >
              {/* Project header */}
              <View className="p-4 flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <FileText size={20} color="#71717a" />
                  <View className="ml-3 flex-1">
                    <Text className="text-zinc-100 font-bold">{project.name}</Text>
                    <Text className="text-zinc-500 text-xs mt-1">
                      {new Date(project.createdAt).toLocaleString()}
                    </Text>
                  </View>
                </View>

                {/* Action buttons */}
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => handleEdit(project.id, project.data?.content || '')}
                    className="p-2 bg-zinc-800 rounded"
                  >
                    <Edit3 size={16} color="#a1a1aa" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(project.id, project.name)}
                    className="p-2 bg-zinc-800 rounded"
                  >
                    <Trash2 size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Content preview or edit */}
              {editingId === project.id ? (
                <View className="p-4 pt-0">
                  <TextInput
                    className="bg-zinc-950 border border-zinc-700 text-zinc-100 p-3 rounded min-h-24"
                    value={editContent}
                    onChangeText={setEditContent}
                    multiline
                    autoFocus
                  />
                  <View className="flex-row gap-2 mt-3">
                    <TouchableOpacity
                      onPress={() => handleSaveEdit(project.id)}
                      className="flex-1 bg-cyan-600 py-3 rounded items-center"
                    >
                      <Text className="text-white font-bold">Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleCancelEdit}
                      className="flex-1 bg-zinc-800 py-3 rounded items-center"
                    >
                      <Text className="text-zinc-400 font-bold">Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                project.data?.content && (
                  <View className="px-4 pb-4">
                    <Text className="text-zinc-400 text-sm" numberOfLines={3}>
                      {project.data.content}
                    </Text>
                  </View>
                )
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
