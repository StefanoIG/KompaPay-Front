import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Tablero, Tarea } from '../../hooks/react-native-hooks/types';

interface TareasBoardProps {
  tableros: Tablero[];
  tareasPorTablero: Record<string, Tarea[]>;
  onTareaPress: (tarea: Tarea) => void;
  onNuevaTarea: (tableroId: string) => void;
  onNuevaColumna: () => void;
}

export const TareasBoard: React.FC<TareasBoardProps> = ({ tableros, tareasPorTablero, onTareaPress, onNuevaTarea, onNuevaColumna }) => {
  return (
    <View style={styles.container}>
      <FlatList
        data={tableros}
        horizontal
        keyExtractor={t => t.id}
        renderItem={({ item: tablero }) => (
          <View style={styles.tablero}>
            <Text style={styles.tableroTitulo}>{tablero.nombre}</Text>
            <FlatList
              data={tareasPorTablero[tablero.id] || []}
              keyExtractor={t => t.id}
              renderItem={({ item: tarea }) => (
                <TouchableOpacity style={styles.tarea} onPress={() => onTareaPress(tarea)}>
                  <Text style={styles.tareaTitulo}>{tarea.titulo}</Text>
                  <Text style={styles.tareaEstado}>{tarea.estado}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.empty}>Sin tareas</Text>}
            />
            <TouchableOpacity style={styles.nuevaTareaBtn} onPress={() => onNuevaTarea(tablero.id)}>
              <Text style={styles.nuevaTareaText}>+ Nueva tarea</Text>
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={
          <TouchableOpacity style={styles.nuevaColumnaBtn} onPress={onNuevaColumna}>
            <Text style={styles.nuevaColumnaText}>+ Nueva columna</Text>
          </TouchableOpacity>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', padding: 8 },
  tablero: { backgroundColor: '#fff', borderRadius: 8, marginRight: 12, padding: 8, minWidth: 220, elevation: 2 },
  tableroTitulo: { fontWeight: 'bold', fontSize: 16, marginBottom: 8 },
  tarea: { backgroundColor: '#f3f4f6', borderRadius: 6, padding: 8, marginBottom: 8 },
  tareaTitulo: { fontSize: 15, fontWeight: '500' },
  tareaEstado: { fontSize: 12, color: '#888' },
  nuevaTareaBtn: { marginTop: 8, padding: 6, backgroundColor: '#e0e7ff', borderRadius: 6 },
  nuevaTareaText: { color: '#3730a3', fontWeight: 'bold' },
  nuevaColumnaBtn: { justifyContent: 'center', alignItems: 'center', padding: 10, backgroundColor: '#dbeafe', borderRadius: 8, minWidth: 120 },
  nuevaColumnaText: { color: '#2563eb', fontWeight: 'bold' },
  empty: { color: '#aaa', fontStyle: 'italic', textAlign: 'center', marginVertical: 8 },
});
