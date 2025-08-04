// app/colaboracion/notas.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  SafeAreaView
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import { useNotas } from '@/hooks/useNotas';
import { KompaColors, Shadows } from '@/constants/Styles';
import { Nota } from '@/config/config';

export default function NotasScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNotaTitle, setNewNotaTitle] = useState('');
  const [newNotaContent, setNewNotaContent] = useState('');

  // Hook para datos de notas
  const { 
    notas, 
    loading, 
    error,
    loadNotas,
    createNota
  } = useNotas(groupId || '');

  useEffect(() => {
    if (groupId) {
      loadNotas();
    }
  }, [groupId, loadNotas]);

  const handleCreateNota = async () => {
    if (!newNotaTitle.trim()) {
      Alert.alert('Error', 'El título de la nota es requerido');
      return;
    }

    try {
      await createNota({
        titulo: newNotaTitle.trim(),
        contenido: newNotaContent.trim(),
      });
      setNewNotaTitle('');
      setNewNotaContent('');
      setShowCreateModal(false);
      Alert.alert('Éxito', 'Nota creada correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear la nota');
    }
  };

  const renderNotaItem = ({ item }: { item: Nota }) => (
    <TouchableOpacity 
      style={[styles.notaCard, Shadows.md]}
      onPress={() => router.push(`/colaboracion/nota_detalle?notaId=${item.id}&groupId=${groupId}`)}
    >
      <View style={styles.notaHeader}>
        <Text style={styles.notaTitle}>{item.titulo}</Text>
        {item.bloqueada_por && (
          <Ionicons name="lock-closed" size={16} color={KompaColors.warning} />
        )}
      </View>
      <Text style={styles.notaPreview} numberOfLines={3}>
        {item.contenido || 'Sin contenido...'}
      </Text>
      <View style={styles.notaFooter}>
        <Text style={styles.notaDate}>
          {new Date(item.updated_at).toLocaleDateString()}
        </Text>
        {item.bloqueador && (
          <Text style={styles.notaAuthor}>
            Editando: {item.bloqueador.name}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (!groupId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>ID de grupo no encontrado</Text>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loading && notas.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={KompaColors.primary} />
          <Text style={styles.loadingText}>Cargando notas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notas Colaborativas</Text>
        <TouchableOpacity onPress={() => setShowCreateModal(true)}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Contenido principal */}
      {notas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color={KompaColors.textSecondary} />
          <Text style={styles.emptyTitle}>No hay notas</Text>
          <Text style={styles.emptySubtitle}>Crea tu primera nota colaborativa</Text>
          <TouchableOpacity 
            style={styles.createButton} 
            onPress={() => setShowCreateModal(true)}
          >
            <Text style={styles.createButtonText}>Crear Nota</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={notas}
          renderItem={renderNotaItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshing={loading}
          onRefresh={loadNotas}
        />
      )}

      {/* Modal para crear nota */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Crear Nueva Nota</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Título de la nota"
              value={newNotaTitle}
              onChangeText={setNewNotaTitle}
              autoFocus
            />
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="Contenido de la nota"
              value={newNotaContent}
              onChangeText={setNewNotaContent}
              multiline
              numberOfLines={4}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]} 
                onPress={handleCreateNota}
              >
                <Text style={styles.confirmButtonText}>Crear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: KompaColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: KompaColors.primary,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: KompaColors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: KompaColors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: KompaColors.gray300,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: KompaColors.textPrimary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: KompaColors.textPrimary,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: KompaColors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: KompaColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  notaCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  notaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  notaTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: KompaColors.textPrimary,
    flex: 1,
  },
  notaPreview: {
    fontSize: 14,
    color: KompaColors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  notaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notaDate: {
    fontSize: 12,
    color: KompaColors.textSecondary,
  },
  notaAuthor: {
    fontSize: 12,
    color: KompaColors.warning,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: KompaColors.gray300,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  modalTextArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 6,
  },
  cancelButton: {
    backgroundColor: KompaColors.gray200,
  },
  confirmButton: {
    backgroundColor: KompaColors.primary,
  },
  cancelButtonText: {
    textAlign: 'center',
    color: KompaColors.textPrimary,
  },
  confirmButtonText: {
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
  },
});
