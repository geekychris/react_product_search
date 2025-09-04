#!/bin/bash

echo "🔍 Testing OpenSearch Text Search Functionality"
echo "=============================================="

# Check if OpenSearch is running
if ! curl -s http://localhost:30920/_cluster/health > /dev/null; then
    echo "❌ OpenSearch is not running on localhost:30920"
    exit 1
fi

echo "✅ OpenSearch is running"

# Test queries
declare -a queries=("Samsung" "Apple" "laptop" "phone" "Nike" "gaming" "wireless" "kitchen" "LEGO" "furniture")

echo ""
echo "📋 Testing search queries..."
echo "=============================="

for query in "${queries[@]}"; do
    result=$(curl -s "http://localhost:30920/products/_search" \
        -H "Content-Type: application/json" \
        -d "{\"query\":{\"multi_match\":{\"query\":\"$query\",\"fields\":[\"name^3\",\"description^2\",\"brand^2\",\"category\",\"subcategory\",\"tags^1.5\"],\"type\":\"best_fields\",\"fuzziness\":\"AUTO\"}},\"size\":0}" \
        | jq -r '.hits.total.value // "error"')
    
    if [ "$result" = "error" ] || [ "$result" = "null" ]; then
        echo "❌ Query '$query': ERROR"
    else
        echo "✅ Query '$query': $result results"
    fi
done

echo ""
echo "🔍 Sample search results for 'Electronics':"
echo "============================================="

curl -s "http://localhost:30920/products/_search" \
    -H "Content-Type: application/json" \
    -d '{"query":{"multi_match":{"query":"Electronics","fields":["name^3","description^2","brand^2","category","subcategory","tags^1.5"],"type":"best_fields","fuzziness":"AUTO"}},"size":3,"_source":["name","brand","category","price"]}' \
    | jq -r '.hits.hits[]._source | "\(.name) (\(.brand)) - \(.category) - $\(.price)"'

echo ""
echo "🎯 Testing fuzzy search with typos:"
echo "===================================="

# Test fuzzy matching with intentional typos
declare -a fuzzy_queries=("Samsng" "Aple" "elektronics" "smartphne")

for query in "${fuzzy_queries[@]}"; do
    result=$(curl -s "http://localhost:30920/products/_search" \
        -H "Content-Type: application/json" \
        -d "{\"query\":{\"multi_match\":{\"query\":\"$query\",\"fields\":[\"name^3\",\"description^2\",\"brand^2\",\"category\",\"subcategory\",\"tags^1.5\"],\"type\":\"best_fields\",\"fuzziness\":\"AUTO\"}},\"size\":0}" \
        | jq -r '.hits.total.value // "error"')
    
    if [ "$result" = "error" ] || [ "$result" = "null" ]; then
        echo "❌ Fuzzy '$query': ERROR"
    else
        echo "✅ Fuzzy '$query': $result results"
    fi
done

echo ""
echo "📊 Testing aggregation with search:"
echo "===================================="

curl -s "http://localhost:30920/products/_search" \
    -H "Content-Type: application/json" \
    -d '{"query":{"multi_match":{"query":"gaming","fields":["name^3","description^2","brand^2","category","subcategory","tags^1.5"],"type":"best_fields","fuzziness":"AUTO"}},"size":0,"aggs":{"categories":{"terms":{"field":"category","size":5}}}}' \
    | jq -r '.aggregations.categories.buckets[] | "\(.key): \(.doc_count) products"'

echo ""
echo "✅ Search functionality test complete!"
echo "💡 If all tests show results > 0, the search is working correctly."
