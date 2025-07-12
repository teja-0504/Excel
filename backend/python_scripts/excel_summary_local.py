import sys
import json
import pandas as pd

def generate_basic_summary(dataframe):
    # Generate a detailed summary with separate lines for rows and columns
    summary_lines = []
    summary_lines.append(f"Number of rows: {len(dataframe)}")
    # Add the first line (header row with indexes and column names)
    header_line = " ".join([str(i) for i in range(len(dataframe.columns))]) + " " + " ".join(dataframe.columns)
    summary_lines.append(header_line.strip())
    summary_lines.append(f"Number of columns: {len(dataframe.columns)}")
    summary_lines.append("Columns:")
    summary_lines.append(", ".join(dataframe.columns))
    summary_lines.append("First 5 rows:")
    summary_lines.append(dataframe.head(5).to_string(index=False).strip())
    return "\n".join(summary_lines)

def main():
    if len(sys.argv) < 2:
        print("Usage: python excel_summary_local.py <json_data_file>")
        sys.exit(1)

    json_file = sys.argv[1]
    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    df = pd.DataFrame(data)
    summary = generate_basic_summary(df)
    print(summary)

if __name__ == "__main__":
    main()
