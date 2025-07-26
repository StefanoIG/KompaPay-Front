import { KompaColors } from '@/constants/Styles';
import { tabsStyles } from '@/styles/tabs.styles';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export const WebExplore: React.FC = () => {
  // Datos temporales para la demo
  const categories = [
    { id: '1', name: 'Comida', icon: 'restaurant', amount: 450.00 },
    { id: '2', name: 'Transporte', icon: 'car', amount: 200.00 },
    { id: '3', name: 'Entretenimiento', icon: 'game-controller', amount: 150.00 },
    { id: '4', name: 'Compras', icon: 'bag', amount: 300.00 },
  ];

  const insights = [
    {
      type: 'warning',
      title: 'Gasto Alto en Comida',
      description: 'Has gastado 20% más en comida este mes comparado con el anterior.'
    },
    {
      type: 'info',
      title: 'Ahorro Potencial',
      description: 'Podrías ahorrar €50 reduciendo gastos en entretenimiento.'
    }
  ];

  const transactions = [
    {
      id: '1',
      description: 'Cena en restaurante',
      amount: 45.50,
      type: 'expense',
      category: 'Comida',
      date: new Date().toISOString()
    },
    {
      id: '2',
      description: 'Gasolina',
      amount: 60.00,
      type: 'expense',
      category: 'Transporte',
      date: new Date().toISOString()
    }
  ];

  return (
    <ScrollView style={tabsStyles.container} contentContainerStyle={{ padding: 20 }}>
      {/* Header */}
      <View style={{ marginBottom: 20 }}>
        <Text style={tabsStyles.headerTitle}>Explorar Gastos</Text>
        <Text style={tabsStyles.headerSubtitle}>
          Analiza tus patrones de gasto y descubre insights
        </Text>
      </View>

      {/* Categories */}
      <View style={{ marginBottom: 20 }}>
        <Text style={[tabsStyles.headerTitle, { fontSize: 18, marginBottom: 15 }]}>Categorías</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={{
                backgroundColor: KompaColors.background,
                padding: 15,
                borderRadius: 12,
                alignItems: 'center',
                minWidth: 120,
                borderWidth: 1,
                borderColor: KompaColors.border,
              }}
            >
              <Ionicons 
                name={category.icon as any} 
                size={24} 
                color={KompaColors.primary} 
              />
              <Text style={{
                fontSize: 14,
                fontWeight: '500',
                color: KompaColors.textPrimary,
                marginTop: 5,
              }}>
                {category.name}
              </Text>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: KompaColors.textPrimary,
                marginTop: 2,
              }}>
                {category.amount.toFixed(2)} €
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Insights */}
      <View style={{ marginBottom: 20 }}>
        <Text style={[tabsStyles.headerTitle, { fontSize: 18, marginBottom: 15 }]}>Insights</Text>
        {insights.map((insight, index) => (
          <View key={index} style={{
            backgroundColor: KompaColors.background,
            padding: 15,
            borderRadius: 12,
            marginBottom: 10,
            borderWidth: 1,
            borderColor: KompaColors.border,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
              <Ionicons 
                name={insight.type === 'warning' ? 'warning' : 'information-circle'} 
                size={20} 
                color={insight.type === 'warning' ? KompaColors.warning : KompaColors.info} 
              />
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: KompaColors.textPrimary,
                marginLeft: 8,
              }}>
                {insight.title}
              </Text>
            </View>
            <Text style={{
              fontSize: 14,
              color: KompaColors.textSecondary,
              lineHeight: 20,
            }}>
              {insight.description}
            </Text>
          </View>
        ))}
      </View>

      {/* Recent Transactions */}
      <View>
        <Text style={[tabsStyles.headerTitle, { fontSize: 18, marginBottom: 15 }]}>Transacciones Recientes</Text>
        {transactions.length > 0 ? (
          transactions.map((transaction, index) => (
            <TouchableOpacity
              key={index}
              style={{
                backgroundColor: KompaColors.background,
                padding: 15,
                borderRadius: 12,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: KompaColors.border,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '500',
                  color: KompaColors.textPrimary,
                  flex: 1,
                }}>
                  {transaction.description}
                </Text>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: transaction.type === 'expense' ? KompaColors.error : KompaColors.success,
                }}>
                  {transaction.type === 'expense' ? '-' : '+'}
                  {transaction.amount.toFixed(2)} €
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
                <Text style={{
                  fontSize: 14,
                  color: KompaColors.textSecondary,
                }}>
                  {transaction.category}
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: KompaColors.textSecondary,
                }}>
                  {new Date(transaction.date).toLocaleDateString()}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={{
            fontSize: 14,
            color: KompaColors.textSecondary,
            textAlign: 'center',
            fontStyle: 'italic',
          }}>
            No hay transacciones para mostrar
          </Text>
        )}
      </View>
    </ScrollView>
  );
};
