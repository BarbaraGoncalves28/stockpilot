import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useAuth } from "../../../src/auth/AuthContext";
import { useMovements } from "../../../src/modules/stock-movements/hooks/useMovements";

import MovementCard from "../../../src/components/movements/MovementCard";
import MovementSearch from "../../../src/components/movements/MovementSearch";
import MovementsFilters from "../../../src/components/movements/MovementsFilters";

import { styles } from "./movements.styles";

export default function MovementsScreen() {
  const { accessToken, user } = useAuth();
  const router = useRouter();

  const {
    movements,
    selectedFilter,
    searchInput,
    setSearchInput,
    searchTerm,
    setSearchTerm,
    sortNewest,
    setSortNewest,
    page,
    totalPages,
    counts,
    loading,
    refreshing,
    error,
    filteredMovements,
    paginatedMovements,
    percentageChange,
    percentageLabel,
    loadMovements,
    handleFilterChange,
    handleRefresh,
    handlePageChange,
  } = useMovements(accessToken);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#00E599"
          />
        }
      >
        <View style={styles.topRow}>
          <View style={styles.summary}>
            <Text style={styles.summaryLabel}>
              Total de movimentações
            </Text>

            <Text style={styles.summaryValue}>
              {counts.ALL}
            </Text>

            <View style={styles.percentageRow}>
              {percentageChange !== null && (
                <Ionicons
                  name={
                    percentageChange >= 0
                      ? "arrow-up"
                      : "arrow-down"
                  }
                  size={16}
                  color={
                    percentageChange >= 0
                      ? "#00E599"
                      : "#FF3366"
                  }
                />
              )}

              <Text
                style={[
                  styles.percentageText,
                  percentageChange !== null &&
                    percentageChange < 0 &&
                    styles.negativePercentage,
                ]}
              >
                {percentageLabel}
              </Text>
            </View>
          </View>

          {user?.role === "ADMIN" && (
            <Pressable
              onPress={() =>
                router.push("/(tabs)/movement-create")
              }
              style={styles.addButton}
            >
              <Ionicons
                name="add"
                size={23}
                color="#050B14"
              />
              <Text style={styles.addButtonText}>
                Nova movimentação
              </Text>
            </Pressable>
          )}
        </View>

        <MovementSearch
          value={searchInput}
          onChangeText={setSearchInput}
          onSearch={() => setSearchTerm(searchInput)}
        />

        <MovementsFilters
          selected={selectedFilter}
          onSelect={handleFilterChange}
          counts={counts}
        />

        <View style={styles.historyHeader}>
          <View style={styles.historyText}>
            <Text style={styles.sectionTitle}>
              Histórico
            </Text>

            <Text style={styles.sectionDescription}>
              Registros mais recentes de movimentações no seu estoque.
            </Text>
          </View>

          <Pressable
            onPress={() =>
              setSortNewest((current) => !current)
            }
            style={styles.sortButton}
          >
            <Ionicons
              name="calendar-outline"
              size={17}
              color="#8B9BB4"
            />

            <Text style={styles.sortText}>
              {sortNewest ? "Mais recentes" : "Mais antigos"}
            </Text>

            <Ionicons
              name="chevron-down"
              size={16}
              color="#8B9BB4"
            />
          </Pressable>
        </View>

        {loading && movements.length === 0 ? (
          <ActivityIndicator
            style={styles.loading}
            color="#00E599"
            size="large"
          />
        ) : null}

        {error ? (
          <View style={styles.feedback}>
            <Ionicons
              name="alert-circle-outline"
              size={27}
              color="#FF3366"
            />

            <Text style={styles.feedbackTitle}>
              Não foi possível carregar
            </Text>

            <Text style={styles.feedbackText}>
              {error}
            </Text>

            <Pressable
              onPress={() => loadMovements(1, false)}
              style={styles.retryButton}
            >
              <Text style={styles.retryText}>
                Tentar novamente
              </Text>
            </Pressable>
          </View>
        ) : null}

        {!loading && !error && filteredMovements.length === 0 ? (
          <View style={styles.feedback}>
            <Ionicons
              name="file-tray-outline"
              size={30}
              color="#00D1FF"
            />

            <Text style={styles.feedbackTitle}>
              {searchTerm
                ? "Nenhum resultado encontrado"
                : "Nenhuma movimentação"}
            </Text>

            <Text style={styles.feedbackText}>
              {searchTerm
                ? "Tente buscar por outro produto, código ou motivo."
                : "Ainda não existem registros para o filtro selecionado."}
            </Text>
          </View>
        ) : null}

        {!error && filteredMovements.length > 0 ? (
          <View style={styles.list}>
            {paginatedMovements.map((movement) => (
              <MovementCard
                key={movement.id}
                movement={movement}
              />
            ))}
          </View>
        ) : null}



        {!loading && !error && filteredMovements.length > 0 && totalPages > 1 ? (
          <View style={styles.pagination}>
            <Pressable
              disabled={page <= 1}
              onPress={() => handlePageChange(page - 1)}
              style={[styles.paginationButton, page <= 1 && styles.paginationButtonDisabled]}
            >
              <Ionicons name="chevron-back" size={19} color={page <= 1 ? "#536174" : "#00E599"} />
            </Pressable>

            <Text style={styles.paginationText}>{page} / {totalPages}</Text>

            <Pressable
              disabled={page >= totalPages}
              onPress={() => handlePageChange(page + 1)}
              style={[styles.paginationButton, page >= totalPages && styles.paginationButtonDisabled]}
            >
              <Ionicons name="chevron-forward" size={19} color={page >= totalPages ? "#536174" : "#00E599"} />
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
