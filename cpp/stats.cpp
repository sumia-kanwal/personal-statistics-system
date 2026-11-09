#include <algorithm>
#include <cctype>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <map>
#include <sstream>
#include <string>
#include <vector>

struct Record {
    std::string name;
    double age = 0;
    std::string gender;
    std::string education;
    double heightCm = 0;
    double weightKg = 0;
    std::string status;
    double sleepHours = 0;
    double exerciseMinutes = 0;
};

static std::string trim(const std::string& text) {
    std::size_t start = 0;
    while (start < text.size() && std::isspace(static_cast<unsigned char>(text[start]))) {
        ++start;
    }
    std::size_t end = text.size();
    while (end > start && std::isspace(static_cast<unsigned char>(text[end - 1]))) {
        --end;
    }
    return text.substr(start, end - start);
}

static std::vector<std::string> parseCsvLine(const std::string& line) {
    std::vector<std::string> fields;
    std::string field;
    bool inQuotes = false;
    for (std::size_t i = 0; i < line.size(); ++i) {
        const char ch = line[i];
        if (inQuotes) {
            if (ch == '"') {
                if (i + 1 < line.size() && line[i + 1] == '"') {
                    field.push_back('"');
                    ++i;
                } else {
                    inQuotes = false;
                }
            } else {
                field.push_back(ch);
            }
        } else if (ch == '"') {
            inQuotes = true;
        } else if (ch == ',') {
            fields.push_back(field);
            field.clear();
        } else {
            field.push_back(ch);
        }
    }
    fields.push_back(field);
    return fields;
}

static double toNumber(const std::string& text) {
    try {
        return std::stod(trim(text));
    } catch (...) {
        return 0.0;
    }
}

static void printDistribution(const std::string& title, const std::map<std::string, int>& counts, int total) {
    std::cout << title << "\n";
    if (total == 0) {
        std::cout << "  (none)\n";
        return;
    }
    for (const auto& item : counts) {
        const double pct = 100.0 * item.second / total;
        std::cout << "  " << item.first << ": " << item.second
                  << " (" << std::fixed << std::setprecision(1) << pct << "%)\n";
    }
}

int main(int argc, char* argv[]) {
    if (argc < 2) {
        std::cerr << "Usage: stats.exe <exported-csv-file>\n"
                  << "Example: stats.exe ..\\personal-statistics-records.csv\n";
        return 1;
    }

    std::ifstream input(argv[1]);
    if (!input) {
        std::cerr << "Could not open file: " << argv[1] << "\n";
        return 1;
    }

    std::string line;
    if (!std::getline(input, line)) {
        std::cerr << "The CSV file is empty.\n";
        return 1;
    }
    if (line.size() >= 3 &&
        static_cast<unsigned char>(line[0]) == 0xEF &&
        static_cast<unsigned char>(line[1]) == 0xBB &&
        static_cast<unsigned char>(line[2]) == 0xBF) {
        line = line.substr(3);
    }

    std::vector<Record> records;
    while (std::getline(input, line)) {
        if (trim(line).empty()) {
            continue;
        }
        const std::vector<std::string> cols = parseCsvLine(line);
        if (cols.size() < 15) {
            continue;
        }
        Record row;
        row.name = trim(cols[2]);
        row.age = toNumber(cols[3]);
        row.gender = trim(cols[4]);
        row.education = trim(cols[6]);
        row.heightCm = toNumber(cols[7]);
        row.weightKg = toNumber(cols[8]);
        row.status = trim(cols[10]);
        row.sleepHours = toNumber(cols[12]);
        row.exerciseMinutes = toNumber(cols[13]);
        records.push_back(row);
    }

    const int n = static_cast<int>(records.size());
    std::cout << "Personal Statistics Data Collection System\n";
    std::cout << "C++ descriptive report (actual CSV records only)\n";
    std::cout << "----------------------------------------------\n";
    std::cout << "Total participants: " << n << "\n";

    if (n == 0) {
        std::cout << "The dataset is empty. There is no generated sample data.\n";
        return 0;
    }

    double ageSum = 0, heightSum = 0, weightSum = 0, sleepSum = 0, exerciseSum = 0;
    std::map<std::string, int> genderCounts;
    std::map<std::string, int> educationCounts;
    std::map<std::string, int> statusCounts;
    for (const Record& row : records) {
        ageSum += row.age;
        heightSum += row.heightCm;
        weightSum += row.weightKg;
        sleepSum += row.sleepHours;
        exerciseSum += row.exerciseMinutes;
        genderCounts[row.gender]++;
        educationCounts[row.education]++;
        statusCounts[row.status]++;
    }

    std::cout << std::fixed << std::setprecision(2);
    std::cout << "Average age: " << (ageSum / n) << "\n";
    std::cout << "Average height (cm): " << (heightSum / n) << "\n";
    std::cout << "Average weight (kg): " << (weightSum / n) << "\n";
    std::cout << "Average daily sleep (hours): " << (sleepSum / n) << "\n";
    std::cout << "Average daily exercise (minutes): " << (exerciseSum / n) << "\n\n";
    printDistribution("Gender distribution", genderCounts, n);
    std::cout << "\n";
    printDistribution("Education-level distribution", educationCounts, n);
    std::cout << "\n";
    printDistribution("Student / employee status", statusCounts, n);
    return 0;
}
