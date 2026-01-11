import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  useColorScheme,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { PieChart } from 'react-native-chart-kit';
import { useData } from './services/RetrieveData';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from './constants/Colors';

const screenWidth = Dimensions.get('window').width;

const Details = () => {
  const { data, themeMode } = useData();
  const systemScheme = useColorScheme();
  const theme = Colors[themeMode === "system" ? systemScheme || "light" : themeMode];
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);

  const handleIndustryClick = (industryName: string) => {
  // If the same industry is clicked again, we toggle it off
  setSelectedIndustry((prev) => (prev === industryName ? null : industryName));
};

    // INSERT THIS AFTER handleIndustryClick (around Line 27)
const industryBreakdown = useMemo(() => {
  if (!selectedIndustry || !data) return [];
  
  // We must normalize the category names to match the "spaced" version in your chart
  return data.filter((sub) => {
    const categorySlug = sub.category || "other";
    const categoryName = categorySlug.replace(/-/g, " "); // This turns 'video-streaming' into 'video streaming'
    return categoryName.toLowerCase() === selectedIndustry.toLowerCase();
  });
}, [selectedIndustry, data]);

  const chartData = useMemo(() => {
    if (!data) return [];
    const totals: { [key: string]: number } = {};
    
    data.forEach(sub => {
      let monthly = sub.price;
      if (sub.cycle === 'weekly') monthly = sub.price * 4.33; 
      if (sub.cycle === 'yearly') monthly = sub.price / 12;

      const slug = sub.category || 'other';
      totals[slug] = (totals[slug] || 0) + monthly;
    });

    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
    return Object.keys(totals).map((key, i) => ({
      name: key.replace(/-/g, ' '), 
      population: parseFloat(totals[key].toFixed(2)),
      color: colors[i % colors.length],
      // We still keep these for internal chart logic, but the legend is manual now
    }));
  }, [data]);

  const totalMonthly = chartData.reduce((acc, curr) => acc + curr.population, 0);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.headerSection}>
            <Text style={[styles.title, { color: theme.text }]}>
              Total Expenditure per Month
            </Text>
            <Text style={styles.amount}>₹{totalMonthly.toFixed(2)}</Text>
          </View>

          <View style={styles.chartWrapper}>
            <PieChart
              data={chartData}
              width={screenWidth}
              height={220}
              accessor={"population"}
              backgroundColor={"transparent"}
              paddingLeft={(screenWidth / 4).toString()} // Centers the circle since legend is gone
              center={[0, 0]}
              hasLegend={false} // Disable the default side legend
              chartConfig={{ color: (opacity = 1) => theme.text }}
            />
          </View>

          {/* Custom Legend Section Below the Chart */}
          <View style={styles.legendContainer}>
            {chartData.map((item, index) => {
              // Check if this specific item is currently selected
              const isSelected = selectedIndustry === item.name;

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.legendItem,
                    // Add a subtle background highlight if selected
                    isSelected && {
                      backgroundColor: theme.whiteBackground,
                      borderRadius: 10,
                    },
                  ]}
                  onPress={() => handleIndustryClick(item.name)}
                >
                  <View
                    style={[styles.colorDot, { backgroundColor: item.color }]}
                  />
                  <View style={styles.legendTextWrapper}>
                    <Text
                      style={[
                        styles.legendName,
                        {
                          color: theme.text,
                          fontWeight: isSelected ? "700" : "400",
                        },
                      ]}
                    >
                      {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                    </Text>
                    <Text style={[styles.legendValue, { color: theme.text }]}>
                      ₹{item.population.toFixed(2)}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {selectedIndustry && (
  <View style={[styles.breakdownContainer, { backgroundColor: theme.whiteBackground }]}>
    <Text style={[styles.breakdownTitle, { color: theme.text }]}>
      Breakdown for {selectedIndustry.charAt(0).toUpperCase()+selectedIndustry?.slice(1)}
    </Text>
    
    {industryBreakdown.map((sub) => {
      // Calculate the specific monthly impact of this one sub
      let monthly = sub.price;
      if (sub.cycle === 'weekly') monthly = sub.price * 4.33;
      if (sub.cycle === 'yearly') monthly = sub.price / 12;

      return (
        <View key={sub.id} style={styles.breakdownRow}>
          <Text style={{ color: theme.text }}>{sub.name}</Text>
          <Text style={{ color: theme.text, fontWeight: 'bold' }}>
            ₹{monthly.toFixed(2)} / mo
          </Text>
        </View>
      );
    })}
  </View>
)}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContainer: { paddingBottom: 40 },
  headerSection: { alignItems: 'center', marginTop: 20 },
  title: { fontSize: 18, fontWeight: 'bold' },
  amount: { fontSize: 28, color: '#238737', fontWeight: 'bold', marginVertical: 10 },
  chartWrapper: { alignItems: 'center', justifyContent: 'center' },
  legendContainer: { 
    paddingHorizontal: 20, 
    marginTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap', // Allows legend to wrap to new lines
    justifyContent: 'space-between'
  },
  legendItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    width: '48%', // Show items in two columns
    marginBottom: 15 
  },
  colorDot: { width: 20, height: 20, borderRadius: 10, marginRight: 8 },
  legendTextWrapper: { flex: 1 },
  legendName: { fontSize: 19, fontWeight: '400' },
  legendValue: { fontSize: 12, opacity: 0.7 },
  breakdownContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 15,
    // Add a slight shadow for depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    paddingBottom: 10,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  }
});

export default Details;