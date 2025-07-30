import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Nota } from '../../hooks/react-native-hooks/types';

interface NotasBoardProps {
  notas: Nota[];
  onNotaPress: (nota: Nota) => void;
  onNuevaNota: () => void;
}

export const NotasBoard: React.FC<NotasBoardProps> = ({ notas, onNotaPress, onNuevaNota }) => {
  return (
    <View style={styles.container}>
      <FlatList
        data={notas}
        keyExtractor={n => n.id}
        renderItem={({ item: nota }) => (
          <TouchableOpacity style={styles.nota} onPress={() => onNotaPress(nota)}>
            <Text style={styles.notaTitulo}>{nota.titulo}</Text>
            <Text numberOfLines={2} style={styles.notaContenido}>{nota.contenido}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Sin notas</Text>}
      />
      <TouchableOpacity style={styles.nuevaNotaBtn} onPress={onNuevaNota}>
        <Text style={styles.nuevaNotaText}>+ Nueva nota</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 8 },
  nota: { backgroundColor: '#fffbe7', borderRadius: 8, padding: 10, marginBottom: 10, elevation: 1 },
  notaTitulo: { fontWeight: 'bold', fontSize: 15, marginBottom: 4 },
  notaContenido: { fontSize: 13, color: '#555' },
  nuevaNotaBtn: { marginTop: 12, padding: 10, backgroundColor: '#fef08a', borderRadius: 8, alignItems: 'center' },
  nuevaNotaText: { color: '#b45309', fontWeight: 'bold' },
  empty: { color: '#aaa', fontStyle: 'italic', textAlign: 'center', marginVertical: 8 },
});
