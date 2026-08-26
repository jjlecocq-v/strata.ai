"use client"

import { Building2, CircleDollarSign, FileText, ShieldCheck, TrendingUp, Wallet } from "lucide-react"

import { useAppStore } from "@/components/app-store"
import { BudgetAiTool } from "@/components/assistant/ai-tools"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const currency = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
})

const dateFormat = new Intl.DateTimeFormat("en-AU", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

export function BudgetPage() {
  const { rawBudgetLines, rawBudgetRecommendation, rawVendors, rawLevySchedules, rawFundBalances, rawCashflowForecast } =
    useAppStore()

  // Group fund balances by account
  const fundBalancesByAccount = rawFundBalances.reduce(
    (acc, balance) => {
      if (!acc[balance.accountName]) {
        acc[balance.accountName] = []
      }
      acc[balance.accountName].push(balance)
      return acc
    },
    {} as Record<string, typeof rawFundBalances>,
  )

  // Group levy schedules by account
  const levySchedulesByAccount = rawLevySchedules.reduce(
    (acc, levy) => {
      if (!acc[levy.accountName]) {
        acc[levy.accountName] = []
      }
      acc[levy.accountName].push(levy)
      return acc
    },
    {} as Record<string, typeof rawLevySchedules>,
  )

  // Group cashflow forecast by account
  const cashflowByAccount = rawCashflowForecast.reduce(
    (acc, forecast) => {
      if (!acc[forecast.accountName]) {
        acc[forecast.accountName] = []
      }
      acc[forecast.accountName].push(forecast)
      return acc
    },
    {} as Record<string, typeof rawCashflowForecast>,
  )

  const accounts = Object.keys(fundBalancesByAccount).length
    ? Object.keys(fundBalancesByAccount)
    : Object.keys(cashflowByAccount)

  return (
    <div className="flex flex-col gap-6">
      <BudgetAiTool />

      {rawBudgetRecommendation.summary ? (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
              <CardTitle>Budget recommendation</CardTitle>
            </div>
            <CardDescription>Pre-computed guidance from visible workspace records.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm leading-6">{rawBudgetRecommendation.summary}</p>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Citations</p>
              {rawBudgetRecommendation.citations.length ? (
                <ul className="mt-2 flex flex-wrap gap-2">
                  {rawBudgetRecommendation.citations.map((citation) => (
                    <li key={citation}>
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {citation}
                      </Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">No citations supplied.</p>
              )}
            </div>
            <p className="border-t border-border pt-4 text-xs italic text-muted-foreground">
              {rawBudgetRecommendation.disclaimer || "No disclaimer supplied."}
            </p>
          </CardContent>
        </Card>
      ) : null}

      <section aria-labelledby="financial-position-heading">
        <div className="mb-3 flex items-center gap-2">
          <Wallet className="size-4 text-primary" aria-hidden="true" />
          <h2 id="financial-position-heading" className="text-sm font-semibold">
            Financial position
          </h2>
        </div>
        {accounts.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {accounts.map((accountName) => {
              const balances = fundBalancesByAccount[accountName] ?? []
              const currentBalance = balances.find((b) => b.balanceType === "Current") ?? balances[0]
              const dataQuality =
                currentBalance?.source === "missing"
                  ? "missing"
                  : currentBalance?.source === "manual"
                    ? "assumed"
                    : "sourced"
              return (
                <Card key={accountName} size="sm">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle>{accountName}</CardTitle>
                        <CardDescription>
                          {currentBalance?.balanceAsOf ? `As of ${currentBalance.balanceAsOf}` : "No balance date"}
                        </CardDescription>
                      </div>
                      <Badge variant={dataQuality === "sourced" ? "default" : dataQuality === "missing" ? "destructive" : "secondary"}>
                        {dataQuality}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-2">
                      <div>
                        <p className="text-2xl font-bold tabular-nums">
                          {currentBalance ? currency.format(currentBalance.balanceAmount) : "—"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {currentBalance?.balanceType ?? "No balance"} {currentBalance?.source ? `(${currentBalance.source})` : ""}
                        </p>
                      </div>
                      {currentBalance?.notes ? (
                        <p className="text-xs italic text-muted-foreground">{currentBalance.notes}</p>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">
              No fund balance records are visible to this session.
            </CardContent>
          </Card>
        )}
      </section>

      <Separator />

      <section aria-labelledby="levy-schedule-heading">
        <div className="mb-3 flex items-center gap-2">
          <TrendingUp className="size-4 text-primary" aria-hidden="true" />
          <h2 id="levy-schedule-heading" className="text-sm font-semibold">
            Levy schedule
          </h2>
        </div>
        {rawLevySchedules.length ? (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Due date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rawLevySchedules.map((levy) => (
                    <TableRow key={levy.id}>
                      <TableCell className="font-medium">{levy.accountName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{levy.levyType}</Badge>
                      </TableCell>
                      <TableCell>{levy.purpose ?? "—"}</TableCell>
                      <TableCell className="text-right tabular-nums">{currency.format(levy.amount)}</TableCell>
                      <TableCell>{levy.dueOn}</TableCell>
                      <TableCell>
                        <Badge variant={levy.issuedOn ? "default" : "secondary"}>{levy.issuedOn ? "Issued" : "Pending"}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">
              No levy schedules are visible to this session.
            </CardContent>
          </Card>
        )}
      </section>

      <Separator />

      <section aria-labelledby="cashflow-forecast-heading">
        <div className="mb-3 flex items-center gap-2">
          <CircleDollarSign className="size-4 text-primary" aria-hidden="true" />
          <h2 id="cashflow-forecast-heading" className="text-sm font-semibold">
            Cashflow forecast (12 months)
          </h2>
        </div>
        {rawCashflowForecast.length ? (
          <div className="flex flex-col gap-4">
            {accounts.map((accountName) => {
              const forecast = cashflowByAccount[accountName] ?? []
              return forecast.length ? (
                <Card key={accountName}>
                  <CardHeader>
                    <CardTitle>{accountName}</CardTitle>
                    <CardDescription>Month-by-month projection</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Month</TableHead>
                          <TableHead className="text-right">Opening</TableHead>
                          <TableHead className="text-right">Levy inflows</TableHead>
                          <TableHead className="text-right">Known outflows</TableHead>
                          <TableHead className="text-right">Projected balance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {forecast.map((month) => (
                          <TableRow key={month.forecastMonth}>
                            <TableCell className="font-medium">
                              {new Date(month.forecastMonth).toLocaleDateString("en-AU", { month: "short", year: "numeric" })}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">{currency.format(month.openingBalance)}</TableCell>
                            <TableCell className="text-right tabular-nums text-green-600">
                              {month.levyInflows > 0 ? `+${currency.format(month.levyInflows)}` : "—"}
                            </TableCell>
                            <TableCell className="text-right tabular-nums text-red-600">
                              {month.knownOutflows > 0 ? `−${currency.format(month.knownOutflows)}` : "—"}
                            </TableCell>
                            <TableCell className="text-right tabular-nums font-semibold">
                              {currency.format(month.projectedBalance)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ) : null
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">
              No cashflow forecast data available. Generate forecast from levy schedules and fund balances.
            </CardContent>
          </Card>
        )}
      </section>

      <Separator />

      <section aria-labelledby="budget-lines-heading">
        <div className="mb-3 flex items-center gap-2">
          <CircleDollarSign className="size-4 text-primary" aria-hidden="true" />
          <h2 id="budget-lines-heading" className="text-sm font-semibold">
            Budget lines
          </h2>
        </div>
        {rawBudgetLines.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {rawBudgetLines.map((line) => (
              <Card key={`${line.category}-${line.account}`} size="sm">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle>{line.category}</CardTitle>
                      <CardDescription>{line.account}</CardDescription>
                    </div>
                    <Badge variant="outline">{line.risk}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-3 gap-3">
                    {[
                      ["Approved", line.approved],
                      ["Committed", line.committed],
                      ["Actual", line.actual],
                    ].map(([label, value]) => (
                      <div key={String(label)} className="min-w-0">
                        <dt className="text-xs text-muted-foreground">{label}</dt>
                        <dd className="mt-1 truncate text-sm font-semibold tabular-nums" title={currency.format(Number(value))}>
                          {currency.format(Number(value))}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">No budget lines are visible to this session.</CardContent>
          </Card>
        )}
      </section>

      <Separator />

      <section aria-labelledby="vendors-heading">
        <div className="mb-3 flex items-center gap-2">
          <Building2 className="size-4 text-primary" aria-hidden="true" />
          <h2 id="vendors-heading" className="text-sm font-semibold">
            Vendors
          </h2>
        </div>
        {rawVendors.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {rawVendors.map((vendor) => (
              <Card key={vendor.id} size="sm">
                <CardHeader>
                  <CardTitle>{vendor.name}</CardTitle>
                  <CardDescription className="font-mono text-[10px]">vendor:{vendor.id}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 text-sm">
                  <p className="flex items-start gap-2">
                    <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <span>{vendor.insuranceStatus || "Insurance status not recorded"}</span>
                  </p>
                  <p className="break-all text-muted-foreground">{vendor.contactEmail || "Email not recorded"}</p>
                  <p className="text-muted-foreground">{vendor.phone || "Phone not recorded"}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">
              No vendor records are visible to this session.
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  )
}
