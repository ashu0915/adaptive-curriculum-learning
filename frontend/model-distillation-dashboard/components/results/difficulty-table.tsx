"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DifficultySample } from "@/lib/types"

interface DifficultyTableProps {
  items: DifficultySample[]
}

export function DifficultyTable({ items }: DifficultyTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Difficulty Ranking</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sample</TableHead>
              <TableHead>Initial Difficulty</TableHead>
              <TableHead>Final Difficulty</TableHead>
              <TableHead className="text-right">Trend</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="max-w-xs truncate">{item.text}</TableCell>
                <TableCell>{item.initial_difficulty.toFixed(2)}</TableCell>
                <TableCell>{item.difficulty_score.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <Badge variant="secondary" className="text-xs">
                    {item.difficulty_score > item.initial_difficulty ? "Harder" : "Easier"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
