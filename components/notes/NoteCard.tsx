// src/components/notes/NoteCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Nota } from '@/config/config';
import { KompaColors, Shadows } from '@/constants/Styles';
import { formatDate } from '@/utils/formatters';

export const NoteCard = ({ note, onPress }: { note: Nota, onPress: () => void }) => {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <View style={styles.header}>
                <Text style={styles.title} numberOfLines={1}>{note.titulo}</Text>
                {note.bloqueada_por && <Ionicons name="lock-closed" size={16} color={KompaColors.warning} />}
            </View>
            <Text style={styles.content} numberOfLines={2}>{note.contenido}</Text>
            <View style={styles.footer}>
                <Text style={styles.footerText}>Modificado: {formatDate(note.updated_at)}</Text>
                {/* Asumiendo que el grupo se obtiene por separado */}
                <View style={styles.groupBadge}>
                    <Text style={styles.groupText}>{note.grupo_id}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: KompaColors.textPrimary,
        flex: 1,
    },
    content: {
        fontSize: 14,
        color: KompaColors.textSecondary,
        lineHeight: 20,
        marginBottom: 12,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: KompaColors.textPrimarySecondary,
    },
    groupBadge: {
        backgroundColor: KompaColors.primary + '20', // Tono claro del color primario
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    groupText: {
        fontSize: 12,
        color: KompaColors.primary,
        fontWeight: '500',
    },
});
