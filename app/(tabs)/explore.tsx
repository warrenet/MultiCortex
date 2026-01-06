import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useStore } from '../../src/store';
import { FileText } from 'lucide-react-native';

export default function ProjectsTab() {
  const { projects } = useStore();

  return (
    <View className="flex-1 bg-zinc-950">
      {/* Header */}
      <View className="bg-zinc-900 border-b border-zinc-800 p-4 pt-12">
        <Text className="text-zinc-100 font-bold text-lg tracking-wider">PROJECTS</Text>
        <Text className="text-zinc-500 text-xs mt-1">{projects.length} captured data streams</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        {projects.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <FileText size={48} color="#3f3f46" />
            <Text className="text-zinc-600 mt-4 text-center">
              No projects yet.{'\n'}Use the Home tab to ingest data.
            </Text>
          </View>
        ) : (
          projects.map((project) => (
            <TouchableOpacity
              key={project.id}
              className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 mb-3 active:bg-zinc-800"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <FileText size={20} color="#71717a" />
                  <View className="ml-3 flex-1">
                    <Text className="text-zinc-100 font-bold">{project.name}</Text>
                    <Text className="text-zinc-500 text-xs mt-1">
                      {new Date(project.createdAt).toLocaleString()}
                    </Text>
                  </View>
                </View>
              </View>
              {project.data?.content && (
                <Text className="text-zinc-400 text-sm mt-3" numberOfLines={2}>
                  {project.data.content}
                </Text>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}
